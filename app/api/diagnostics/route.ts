import { MAX_DIAGNOSTIC_BYTES, sanitizeDiagnostic } from "../../../lib/diagnostic-schema";
import { DiagnosticError, openDiagnosticStore, persistDiagnostic } from "../../../lib/diagnostic-store";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(request: Request) {
  try {
    if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
      throw new DiagnosticError(415, "json_required");
    if (Number(request.headers.get("content-length") ?? 0) > MAX_DIAGNOSTIC_BYTES)
      throw new DiagnosticError(413, "report_too_large");
    const reader = request.body?.getReader();
    if (!reader) throw new DiagnosticError(400, "invalid_report");
    const chunks: Uint8Array[] = []; let length = 0;
    const deadline=Date.now()+10000;
    while (true) {
      const remaining=deadline-Date.now();
      if(remaining<=0){await reader.cancel();throw new DiagnosticError(408,"upload_timed_out");}
      let timer: ReturnType<typeof setTimeout>|undefined;
      let next;
      try{
        next=await Promise.race([reader.read(),new Promise<never>((_,reject)=>{
          timer=setTimeout(()=>reject(new DiagnosticError(408,"upload_timed_out")),remaining);
        })]);
      }finally{if(timer)clearTimeout(timer);}
      if (next.done) break;
      length += next.value.length;
      if (length > MAX_DIAGNOSTIC_BYTES) { await reader.cancel(); throw new DiagnosticError(413, "report_too_large"); }
      chunks.push(next.value);
    }
    const body = Buffer.concat(chunks);
    let value;
    try { value = sanitizeDiagnostic(JSON.parse(body.toString("utf8"))); }
    catch { throw new DiagnosticError(400, "invalid_report"); }
    const db = openDiagnosticStore();
    try {
      // The reverse proxy must replace this header. No IP is stored in a report.
      const ip = request.headers.get("x-real-ip") ?? "unknown";
      const receipt = persistDiagnostic(db, value, ip);
      return Response.json({ ok: true, receipt: { ...receipt,
        upload_sha256: createHash("sha256").update(body).digest("hex") } }, { status: 201, headers });
    } finally { db.close(); }
  } catch (error) {
    if (error instanceof DiagnosticError)
      return Response.json({ ok: false, error: error.code }, { status: error.status, headers });
    console.error("Private diagnostic persistence failed", error instanceof Error ? error.name : "unknown");
    return Response.json({ ok: false, error: "storage_failed" }, { status: 503, headers });
  }
}
