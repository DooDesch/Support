import { DatabaseSync } from "node:sqlite";
import { createHash, createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { chmodSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { isAbsolute, join, resolve, relative, sep } from "node:path";
import { DIAGNOSTIC_RETENTION_DAYS, type Diagnostic } from "./diagnostic-schema.ts";

export class DiagnosticError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string) { super(code); this.status=status; this.code=code; }
}
function diagnosticKey(create=false): string {
  const configured=process.env.DIAGNOSTICS_ADMIN_TOKEN;
  if(configured&&configured.length>=43)return configured;
  const root=process.env.DIAGNOSTICS_DIRECTORY??"";
  if(!isAbsolute(root))throw new DiagnosticError(503,"diagnostics_unavailable");
  const file=join(root,"admin-token");
  if(create&&!existsSync(file)){
    try{writeFileSync(file,randomBytes(32).toString("base64url"),{flag:"wx",mode:0o600});}
    catch(error){if(!(error instanceof Error&&"code" in error&&error.code==="EEXIST"))throw error;}
  }
  const key=readFileSync(file,"utf8").trim();
  if(key.length<43)throw new DiagnosticError(503,"diagnostics_unavailable");
  return key;
}
export function adminAuthorized(request: Request): boolean {
  let expected;
  try{expected=diagnosticKey();}catch{return false;}
  const supplied = request.headers.get("authorization") ?? "";
  if (expected.length < 43 || Buffer.byteLength(supplied) !== Buffer.byteLength(expected) + 7) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(`Bearer ${expected}`));
}
export function openDiagnosticStore(): DatabaseSync {
  const root = process.env.DIAGNOSTICS_DIRECTORY ?? "";
  if (!isAbsolute(root)) throw new DiagnosticError(503, "diagnostics_unavailable");
  const path = resolve(/*turbopackIgnore: true*/ root);
  // A configured private volume is mandatory. There is no public or temporary fallback.
  const publicRelative=relative(resolve("public"),path);
  if (publicRelative===""||(!publicRelative.startsWith(".."+sep)&&publicRelative!==".."&&!isAbsolute(publicRelative)))
    throw new DiagnosticError(503, "diagnostics_unavailable");
  mkdirSync(path, { recursive: true, mode: 0o700 });
  diagnosticKey(true);
  const database = join(path, "diagnostics.sqlite");
  const db = new DatabaseSync(database, { timeout: 3000 });
  chmodSync(database, 0o600);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA secure_delete=ON;
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY, digest TEXT NOT NULL, fingerprint TEXT NOT NULL,
      received INTEGER NOT NULL, session TEXT NOT NULL, kind TEXT NOT NULL,
      build TEXT NOT NULL, payload TEXT NOT NULL, issue_url TEXT
    );
    CREATE INDEX IF NOT EXISTS reports_fingerprint ON reports(fingerprint);
    CREATE INDEX IF NOT EXISTS reports_session ON reports(session);
    CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, bucket INTEGER NOT NULL, count INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS issue_queue (
      fingerprint TEXT PRIMARY KEY, build TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'pending',
      issue_url TEXT, attempts INTEGER NOT NULL DEFAULT 0
    );
  `);
  return db;
}
export function bundleDigest(value: Diagnostic): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
export function fingerprint(value: Diagnostic): string {
  const error = value.events.findLast((event) => event.level === "error");
  const cause=error?.cause.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/gi,"[id]").replace(/\b\d+(?:\.\d+)?\b/g,"#");
  // Source/line/code group the same failure across participants. Private messages stay out.
  return createHash("sha256").update(JSON.stringify([value.build.multiplayer, value.kind,
    error?.code ?? "manual", error?.source ?? "", error?.line ?? 0,cause??""])).digest("hex").slice(0, 24);
}
export function persistDiagnostic(db: DatabaseSync, value: Diagnostic, ip: string, now = Date.now()) {
  const digest = bundleDigest(value);
  const prior = db.prepare("SELECT digest, received FROM reports WHERE id=?").get(value.report_id);
  if (prior) {
    if (prior.digest !== digest) throw new DiagnosticError(409, "report_id_conflict");
    return { report_id: value.report_id, sha256: digest, stored_at: new Date(Number(prior.received)).toISOString() };
  }
  const key = createHmac("sha256", diagnosticKey()).update(ip).digest("hex");
  const bucket = Math.floor(now / 3600000);
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("DELETE FROM reports WHERE received < ?").run(now - DIAGNOSTIC_RETENTION_DAYS * 86400000);
    db.prepare("DELETE FROM limits WHERE bucket < ?").run(bucket - 1);
    const used = db.prepare("SELECT count FROM limits WHERE key=? AND bucket=?").get(key, bucket);
    if (used && Number(used.count) >= 20) throw new DiagnosticError(429, "rate_limit");
    const total = db.prepare("SELECT COUNT(*) AS count FROM reports").get();
    if (Number(total?.count) >= 10000) throw new DiagnosticError(503, "diagnostics_capacity");
    db.prepare("INSERT INTO limits VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN bucket=excluded.bucket THEN count+1 ELSE 1 END,bucket=excluded.bucket").run(key, bucket);
    db.prepare("INSERT INTO reports(id,digest,fingerprint,received,session,kind,build,payload) VALUES (?,?,?,?,?,?,?,?)")
      .run(value.report_id, digest, fingerprint(value), now, value.diagnostic_session, value.kind, value.build.multiplayer, JSON.stringify(value));
    if(value.kind==="error") db.prepare("INSERT OR IGNORE INTO issue_queue(fingerprint,build) VALUES (?,?)").run(fingerprint(value),value.build.multiplayer);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return { report_id: value.report_id, sha256: digest, stored_at: new Date(now).toISOString() };
}
export function pruneDiagnostics(db: DatabaseSync, now=Date.now()): void {
  db.prepare("DELETE FROM reports WHERE received < ?").run(now-DIAGNOSTIC_RETENTION_DAYS*86400000);
  db.prepare("DELETE FROM limits WHERE bucket < ?").run(Math.floor(now/3600000)-1);
  db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
}
