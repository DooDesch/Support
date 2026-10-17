#!/usr/bin/env node
// Credentials stay in the environment and are sent only to the fixed support origin.
const [command="groups",id]=process.argv.slice(2);
if(command==="--help"){
  console.log("MT2_DIAGNOSTICS_TOKEN=<private admin key> node tools/diagnostics.mjs groups|report <UUID>|session <UUID>");
}else{
  try{
    const token=process.env.MT2_DIAGNOSTICS_TOKEN??"";
    if(token.length<43)throw new Error("MT2_DIAGNOSTICS_TOKEN is missing or invalid");
    if(!["groups","report","session"].includes(command))throw new Error("Expected groups, report or session");
    if(command!=="groups"&&!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id??""))throw new Error("A diagnostic UUID is required");
    const query=command==="groups"?"":"?"+new URLSearchParams({[command==="report"?"id":"session"]:id});
    const response=await fetch("https://support.doodesch.de/api/diagnostics/admin"+query,{
      headers:{Authorization:"Bearer "+token},redirect:"error",signal:AbortSignal.timeout(15000),cache:"no-store",
    });
    if(!response.ok)throw new Error("Private diagnostic read failed HTTP="+response.status);
    console.log(JSON.stringify(await response.json(),null,2));
  }catch(error){console.error(error instanceof Error?error.message:"Private diagnostic read failed");process.exitCode=1;}
}
