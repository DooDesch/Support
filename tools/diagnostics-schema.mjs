import {z} from "zod";
import {diagnosticSchema} from "../lib/diagnostic-schema.ts";
import {readFile,writeFile,mkdir} from "node:fs/promises";
const output=new URL("../api/diagnostics/1.json",import.meta.url);
const schema=z.toJSONSchema(diagnosticSchema);
const serialized=JSON.stringify({...schema,$id:"https://github.com/DooDesch/Support/blob/main/api/diagnostics/1.json"},null,2)+"\n";
if(process.argv.includes("--check")){
  if(await readFile(output,"utf8")!==serialized){console.error("Diagnostic JSON schema is stale. Run node --experimental-strip-types tools/diagnostics-schema.mjs");process.exitCode=1;}
}else{await mkdir(new URL("../api/diagnostics/",import.meta.url),{recursive:true});await writeFile(output,serialized);}
