import { openDiagnosticStore, pruneDiagnostics } from "./diagnostic-store";
import { syncDiagnosticIssues } from "./diagnostic-issues";
import { createReportIssue } from "./github";
import { serverConfig } from "./env";
import { Octokit } from "octokit";

let running=false;
export async function maintainDiagnostics(){
  if(running)return;
  running=true;
  try{
    const db=openDiagnosticStore();
    try{
      pruneDiagnostics(db);
      if(process.env.DIAGNOSTICS_PUBLIC_ISSUES!=="true")return;
      const github=new Octokit({auth:serverConfig.githubToken});
      await syncDiagnosticIssues(db,async(signature)=>{
        const rows=await github.paginate(github.rest.issues.listForRepo,{owner:serverConfig.githubOwner,repo:serverConfig.githubRepo,state:"all",labels:"repo:MMORPGTycoon2-Multiplayer",per_page:100});
        return rows.find(row=>row.body?.includes(`<!-- mt2-diagnostic:${signature} -->`))?.html_url??null;
      },createReportIssue);
    }finally{db.close();}
  }finally{running=false;}
}
