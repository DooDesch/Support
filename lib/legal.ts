// Validated operator data for the Impressum and the privacy notice.
// The check runs when a legal page module loads. `next build` loads and
// prerenders both pages, so empty data stops the build with a clear message.
import { operator, privacyFacts } from "@/content/legal";

const DATA_FILE = "content/legal.ts";

const REQUIRED_FIELDS = [
  "name",
  "street",
  "postalCode",
  "city",
  "country",
  "email",
] as const;

export type Operator = Record<(typeof REQUIRED_FIELDS)[number], string>;

export interface PrivacyFacts {
  hostingProvider: string;
  logRetentionDays: number | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateOperator(): Operator {
  const missing = REQUIRED_FIELDS.filter((field) => !operator[field].trim());
  if (missing.length > 0) {
    throw new Error(
      `Impressum data missing: fill ${DATA_FILE} (empty: ${missing
        .map((field) => `operator.${field}`)
        .join(", ")})`,
    );
  }

  if (!EMAIL_PATTERN.test(operator.email.trim())) {
    throw new Error(
      `Impressum data invalid: operator.email in ${DATA_FILE} is not an email address`,
    );
  }

  const trimmed = Object.fromEntries(
    REQUIRED_FIELDS.map((field) => [field, operator[field].trim()]),
  ) as Operator;
  console.info(`Impressum data loaded from ${DATA_FILE}`);
  return trimmed;
}

function validatePrivacyFacts(): PrivacyFacts {
  const days = privacyFacts.logRetentionDays;
  if (days !== null && (!Number.isInteger(days) || days <= 0)) {
    throw new Error(
      `Privacy data invalid: privacyFacts.logRetentionDays in ${DATA_FILE} must be a positive whole number or null`,
    );
  }
  return {
    hostingProvider: privacyFacts.hostingProvider.trim(),
    logRetentionDays: days,
  };
}

export const legalOperator: Operator = validateOperator();
export const legalPrivacyFacts: PrivacyFacts = validatePrivacyFacts();
