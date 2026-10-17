export async function register(){
  if(process.env.NEXT_RUNTIME!=="nodejs"||!process.env.DIAGNOSTICS_DIRECTORY)return;
  const {maintainDiagnostics}=await import("./lib/diagnostic-maintenance");
  const run=()=>maintainDiagnostics().catch(error=>{
    console.error("Private diagnostic maintenance failed",error instanceof Error?error.name:"unknown");
  });
  await run();
  setInterval(run,60000).unref();
}
