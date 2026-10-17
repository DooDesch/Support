import { adminAuthorized, openDiagnosticStore } from "../../../../lib/diagnostic-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
export async function GET(request: Request) {
  if (!adminAuthorized(request)) return Response.json({ error: "unauthorized" }, { status: 401, headers });
  const db = openDiagnosticStore();
  try {
    const url = new URL(request.url), id = url.searchParams.get("id"), session = url.searchParams.get("session");
    if (id) {
      const report = db.prepare("SELECT payload FROM reports WHERE id=?").get(id);
      return report ? Response.json(JSON.parse(String(report.payload)), { headers })
        : Response.json({ error: "not_found" }, { status: 404, headers });
    }
    if (session) return Response.json({ reports: db.prepare("SELECT id,received,kind,build,fingerprint FROM reports WHERE session=? ORDER BY received LIMIT 100").all(session) }, { headers });
    return Response.json({ groups: db.prepare(`SELECT fingerprint, build, kind, COUNT(*) AS reports,
      COUNT(DISTINCT session) AS sessions, MAX(received) AS latest, MIN(id) AS example
      FROM reports GROUP BY fingerprint,build,kind ORDER BY latest DESC LIMIT 200`).all(),
      sessions: db.prepare("SELECT build,COUNT(DISTINCT session) AS sessions,COUNT(DISTINCT CASE WHEN kind='error' THEN session END) AS affected_sessions FROM reports GROUP BY build").all(),
      issues: db.prepare("SELECT fingerprint,state,issue_url FROM issue_queue LIMIT 200").all() }, { headers });
  } finally { db.close(); }
}
