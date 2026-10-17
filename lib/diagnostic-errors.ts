import {redactDiagnosticText} from "./diagnostic-schema.ts";

export function diagnosticFailureRecord(operation:string,error:unknown){
  const value=error instanceof Error?error:null;
  const extra=value as (Error&{code?:unknown;status?:unknown;cause?:unknown})|null;
  const code=typeof extra?.code==="string"&&/^[A-Z0-9_]{1,60}$/.test(extra.code)?extra.code:undefined;
  const status=typeof extra?.status==="number"?extra.status:undefined;
  return {operation,name:value?.name??"UnknownError",code,status,
    cause:redactDiagnosticText(value?.message??"Non-error rejection").slice(0,1024),
    upstream:extra?.cause instanceof Error?redactDiagnosticText(extra.cause.message).slice(0,512):undefined};
}
export function logDiagnosticFailure(operation:string,error:unknown,tolerated=false){
  const record=diagnosticFailureRecord(operation,error);
  if(tolerated)console.warn("Private diagnostic operation unconfirmed",record);
  else console.error("Private diagnostic operation failed",record);
}
