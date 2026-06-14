import { z } from "zod";

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];

// The optional detail sections that users can progressively add. The order here
// is the order they appear as "add detail" chips in the UI.
export const DETAIL_FIELDS = [
  "description",
  "steps",
  "expected",
  "actual",
  "environment",
  "severity",
  "additional",
  "contact",
] as const;
export type DetailField = (typeof DETAIL_FIELDS)[number];

// Shape used by the form and validated again on the server. Only `title` is
// truly required; everything else is optional ("every hint helps").
export const reportSchema = z.object({
  title: z.string().trim().min(3).max(120),
  // Selected repository as "owner/name", or empty string for "no project".
  repo: z.string().trim().max(160).default(""),
  description: z.string().trim().max(5000).default(""),
  steps: z.string().trim().max(5000).default(""),
  expected: z.string().trim().max(2000).default(""),
  actual: z.string().trim().max(2000).default(""),
  environment: z.string().trim().max(1000).default(""),
  severity: z.enum(SEVERITIES).optional(),
  additional: z.string().trim().max(5000).default(""),
  contact: z.string().trim().max(200).default(""),
  locale: z.enum(["de", "en"]).default("de"),
});

export type ReportInput = z.infer<typeof reportSchema>;

// Full POST payload including anti-spam fields (never shown to the user).
export const reportPayloadSchema = reportSchema.extend({
  // Honeypot: must stay empty. Bots tend to fill every field.
  website: z.string().max(0).default(""),
  // Milliseconds between form mount and submit (min-time-to-submit check).
  elapsedMs: z.coerce.number().min(0).default(0),
  turnstileToken: z.string().default(""),
});

export type ReportPayload = z.infer<typeof reportPayloadSchema>;
