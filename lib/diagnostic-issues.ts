import type { DatabaseSync } from "node:sqlite";

export function publicDiagnosticIssue(group: { fingerprint: string; build: string }) {
  if(!/^[0-9a-f]{24}$/.test(group.fingerprint)||!/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.]+)?$/.test(group.build))
    throw new Error("Invalid diagnostic issue group");
  const marker=`<!-- mt2-diagnostic:${group.fingerprint} -->`;
  return {title:`Multiplayer ${group.build}: reported error ${group.fingerprint.slice(0,8)}`,
    body:`${marker}\nAn error was reported in MMORPG Tycoon 2 Multiplayer ${group.build}.\n\nPrivate diagnostic evidence is available to maintainers in the support inbox. Reports with this failure signature are grouped there.\n\nThis issue contains no report text, player identifiers, logs or attachments.`,
    labels:["bug","repo:MMORPGTycoon2-Multiplayer"]};
}
export async function syncDiagnosticIssues(db: DatabaseSync,
  find:(fingerprint:string)=>Promise<string|null>,
  publish:(issue:ReturnType<typeof publicDiagnosticIssue>)=>Promise<{url:string}>) {
  const rows=db.prepare("SELECT fingerprint,build,state FROM issue_queue WHERE state IN ('pending','unknown') ORDER BY attempts LIMIT 5").all();
  for(const row of rows){
    const signature=String(row.fingerprint),build=String(row.build);
    // An uncertain create is reconciled by reading GitHub. It is never blindly replayed.
    const found=await find(signature);
    if(found){db.prepare("UPDATE issue_queue SET issue_url=?,state='sent' WHERE fingerprint=?").run(found,signature);continue;}
    if(row.state==="unknown")continue;
    const claimed=db.prepare("UPDATE issue_queue SET state='unknown',attempts=attempts+1 WHERE fingerprint=? AND state='pending'").run(signature);
    if(!Number(claimed.changes))continue;
    try{
      const issue=await publish(publicDiagnosticIssue({fingerprint:signature,build}));
      db.prepare("UPDATE issue_queue SET issue_url=?,state='sent' WHERE fingerprint=?").run(issue.url,signature);
    }catch(error){
      console.error("Diagnostic issue creation unconfirmed; awaiting reconciliation",error instanceof Error?error.name:"unknown");
    }
  }
}
