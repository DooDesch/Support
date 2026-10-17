import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { sanitizeDiagnostic } from "../lib/diagnostic-schema.ts";
import { adminAuthorized, openDiagnosticStore, persistDiagnostic, fingerprint } from "../lib/diagnostic-store.ts";
import { publicDiagnosticIssue, syncDiagnosticIssues } from "../lib/diagnostic-issues.ts";
import {diagnosticFailureRecord} from "../lib/diagnostic-errors.ts";

const directory=mkdtempSync(join(tmpdir(),"mt2-report-tests-"));
process.env.DIAGNOSTICS_DIRECTORY=directory;
process.env.DIAGNOSTICS_ADMIN_TOKEN="a".repeat(48);
const sample=()=>({ schema:1,product:"mmorpgtycoon2-multiplayer",report_id:randomUUID(),diagnostic_session:randomUUID(),client_id:randomUUID(),kind:"error",consent:true,comment:"",
  build:{multiplayer:"0.1.0-beta.13",hashes:{multiplayer:"a".repeat(64)},mods:[]},role:"client",peer_slot:2,elapsed_ms:1000,dropped_events:0,
  events:[{ms:500,level:"error",code:"runtime.error",source:"session_wire.cpp",line:50,cause:"handshake timeout",values:{ack_mask:1,required_mask:3},action_id:""}] });
test.after(()=>rmSync(directory,{recursive:true,force:true}));
test("strict allowlist refuses raw packets, paths, saves and unconsented reports",()=>{
  for(const extra of [{save:"bytes"},{packet:"bytes"},{consent:false},{events:[{...sample().events[0],address:"private"}]}])
    assert.throws(()=>sanitizeDiagnostic({...sample(),...extra}));
});
test("redaction removes account, path, address and secrets on the server",()=>{
  const value=sample(); value.events[0].cause="token=secret123 peer=76561198000000000 ip=192.168.1.3 path=C:\\Users\\Alice\\file";
  const safe=sanitizeDiagnostic(value);
  for(const secret of ["secret123","76561198000000000","192.168.1.3","Alice"])assert.equal(JSON.stringify(safe).includes(secret),false);
  value.events[0].cause="Authorization: Bearer header-secret";
  assert.equal(JSON.stringify(sanitizeDiagnostic(value)).includes("header-secret"),false);
  value.events[0].cause="peer76561198000000000 lobby=109775242337075890";
  for(const secret of ["76561198000000000","109775242337075890"])assert.equal(JSON.stringify(sanitizeDiagnostic(value)).includes(secret),false);
});
test("confirmed durable write survives reopening and retry does not duplicate",()=>{
  const value=sanitizeDiagnostic(sample());let db=openDiagnosticStore();
  const first=persistDiagnostic(db,value,"test-ip");db.close();db=openDiagnosticStore();
  const again=persistDiagnostic(db,value,"test-ip");assert.deepEqual(first,again);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM reports WHERE id=?").get(value.report_id).n,1);
  assert.equal(JSON.stringify(db.prepare("SELECT payload FROM reports WHERE id=?").get(value.report_id)).includes("test-ip"),false);
  assert.throws(()=>persistDiagnostic(db,{...value,comment:"changed"},"test-ip"),error=>error.status===409);db.close();
});
test("matching failures group independently of account, report and session",()=>{
  const a=sample(),b=sample();assert.equal(fingerprint(a),fingerprint(b));b.events[0].line++;assert.notEqual(fingerprint(a),fingerprint(b));
});
test("private read rejects missing and wrong admin tokens",()=>{
  for(const token of ["","Bearer bad","Bearer "+"b".repeat(48)])assert.equal(adminAuthorized(new Request("https://localhost",{headers:{authorization:token}})),false);
  assert.equal(adminAuthorized(new Request("https://localhost",{headers:{authorization:"Bearer "+"a".repeat(48)}})),true);
});
test("bounded rate limit is persistent and duplicate receipts remain available",()=>{
  const db=openDiagnosticStore();let first;
  for(let i=0;i<20;i++){const value=sample();persistDiagnostic(db,value,"limited");first??=value;}
  assert.throws(()=>persistDiagnostic(db,sample(),"limited"),error=>error.status===429);
  assert.equal(persistDiagnostic(db,first,"limited").report_id,first.report_id);db.close();
});
test("missing private storage fails closed",()=>{
  const previous=process.env.DIAGNOSTICS_DIRECTORY;delete process.env.DIAGNOSTICS_DIRECTORY;
  assert.throws(()=>openDiagnosticStore(),error=>error.status===503);process.env.DIAGNOSTICS_DIRECTORY=previous;
});
test("public issue summary cannot include report text or diagnostic data",()=>{
  const issue=publicDiagnosticIssue({fingerprint:"a".repeat(24),build:"0.1.0-beta.13",comment:"PRIVATE",events:["SECRET"]});
  assert.equal(JSON.stringify(issue).includes("PRIVATE"),false);assert.equal(JSON.stringify(issue).includes("SECRET"),false);
});
test("upstream errors retain their cause and status without credentials",()=>{
  const fault=Object.assign(new Error("database locked Authorization: Bearer header-secret"),{code:"SQLITE_BUSY",status:503});
  const record=diagnosticFailureRecord("persist report",fault);
  assert.equal(record.code,"SQLITE_BUSY");assert.equal(record.status,503);
  assert.match(record.cause,/database locked/);assert.equal(JSON.stringify(record).includes("header-secret"),false);
});
test("uncertain issue publication is reconciled without duplicate creation",async()=>{
  const db=openDiagnosticStore();db.exec("DELETE FROM issue_queue");
  persistDiagnostic(db,sample(),"outbox");let creates=0;
  await syncDiagnosticIssues(db,async()=>null,async()=>{creates++;throw new Error("timeout");});
  await syncDiagnosticIssues(db,async()=>null,async()=>{creates++;return {url:"https://example.org/duplicate"};});
  assert.equal(creates,1);
  await syncDiagnosticIssues(db,async()=>"https://github.com/example/issues/1",async()=>{throw new Error("must not publish");});
  assert.equal(db.prepare("SELECT state FROM issue_queue").get().state,"sent");db.close();
});
