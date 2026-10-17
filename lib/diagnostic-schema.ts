import { z } from "zod";

export const MAX_DIAGNOSTIC_BYTES = 256 * 1024;
export const DIAGNOSTIC_RETENTION_DAYS = 30;
const uuid = z.string().uuid();
const label = z.string().regex(/^[A-Za-z0-9_.:/ -]{1,120}$/);
const hash = z.string().regex(/^[0-9a-f]{64}$/);
const integer = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);

// No raw packet, game object, environment dump or arbitrary nested data is accepted.
export const diagnosticSchema = z.object({
  schema: z.literal(1),
  product: z.literal("mmorpgtycoon2-multiplayer"),
  report_id: uuid,
  diagnostic_session: uuid,
  client_id: uuid,
  kind: z.enum(["manual", "error", "interrupted", "session"]),
  consent: z.literal(true),
  comment: z.string().max(2000),
  build: z.object({
    multiplayer: z.string().regex(/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.]+)?$/),
    hashes: z.partialRecord(z.enum(["game", "framework", "loader", "multiplayer", "steam"]), hash),
    mods: z.array(z.object({ id: label, version: label }).strict()).max(128),
  }).strict(),
  role: z.enum(["none", "host", "client"]),
  peer_slot: z.number().int().min(0).max(4),
  elapsed_ms: integer,
  dropped_events: integer,
  events: z.array(z.object({
    ms: integer,
    level: z.enum(["info", "warn", "error"]),
    code: label,
    source: z.string().regex(/^[A-Za-z0-9_.-]{0,100}$/),
    line: z.number().int().min(0).max(1000000),
    cause: z.string().max(768),
    values: z.partialRecord(z.enum(["action_sequence", "revision", "peer_slot", "required_mask", "ack_mask", "channel", "bytes", "duration_us", "count", "frame_us"]), integer),
    action_id: z.union([z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/), z.literal("")]),
  }).strict()).max(256),
}).strict();
export type Diagnostic = z.infer<typeof diagnosticSchema>;

export function redactDiagnosticText(text: string): string {
  return text
    .replace(/\b[A-Za-z]:[\\/][^\r\n"<>|]*/g, "[path]")
    .replace(/\/(?:home|Users)\/[^\s"']+/g, "[path]")
    .replace(/\d{17,}/g, "[account]")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g, "[address]")
    .replace(/\bBearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/\b(token|password|authorization|cookie|secret|session_token)\s*[:=]\s*(?:"[^"]*"|'[^']*'|\S+)/gi, "$1=[redacted]")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email]");
}

export function sanitizeDiagnostic(input: unknown): Diagnostic {
  const value = diagnosticSchema.parse(input);
  return {
    ...value,
    comment: redactDiagnosticText(value.comment),
    events: value.events.map((event) => ({ ...event, cause: redactDiagnosticText(event.cause) })),
  };
}
