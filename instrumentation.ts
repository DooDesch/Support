export async function register(){
  if(process.env.NEXT_RUNTIME!=="nodejs"||!process.env.DIAGNOSTICS_DIRECTORY)return;
  const {maintainDiagnostics}=await import("./lib/diagnostic-maintenance");
  const {logDiagnosticFailure}=await import("./lib/diagnostic-errors");
  const run=()=>maintainDiagnostics().catch(error=>{
    logDiagnosticFailure("maintain diagnostic retention and issue outbox",error);
  });
  await run();
  setInterval(run,60000).unref();
}
