import type { ReportInput } from "./schema";

// Localized section headings used inside the GitHub issue body.
const HEADINGS = {
  de: {
    reference: "Bezug",
    description: "Beschreibung",
    steps: "Schritte zur Reproduktion",
    expected: "Erwartetes Verhalten",
    actual: "Tatsächliches Verhalten",
    environment: "Umgebung",
    severity: "Schweregrad",
    additional: "Weitere Informationen",
    contact: "Kontakt",
    submitted: "Eingereicht über",
  },
  en: {
    reference: "Related project",
    description: "Description",
    steps: "Steps to reproduce",
    expected: "Expected behavior",
    actual: "Actual behavior",
    environment: "Environment",
    severity: "Severity",
    additional: "Additional information",
    contact: "Contact",
    submitted: "Submitted via",
  },
} as const;

function section(heading: string, value: string): string {
  return `## ${heading}\n\n${value.trim()}\n`;
}

export function buildIssueBody(input: ReportInput): string {
  const t = HEADINGS[input.locale] ?? HEADINGS.de;
  const parts: string[] = [];

  if (input.repo) {
    const url = `https://github.com/${input.repo}`;
    parts.push(`**${t.reference}:** [${input.repo}](${url})\n`);
  }

  if (input.description) parts.push(section(t.description, input.description));
  if (input.steps) parts.push(section(t.steps, input.steps));
  if (input.expected) parts.push(section(t.expected, input.expected));
  if (input.actual) parts.push(section(t.actual, input.actual));
  if (input.environment) parts.push(section(t.environment, input.environment));
  if (input.severity) parts.push(section(t.severity, input.severity));
  if (input.additional) parts.push(section(t.additional, input.additional));
  if (input.contact) parts.push(section(t.contact, input.contact));

  parts.push(`\n---\n_${t.submitted} support.doodesch.de_`);

  return parts.join("\n");
}

// Labels make triage easy. GitHub auto-creates labels that don't exist yet.
export function buildIssueLabels(input: ReportInput): string[] {
  const labels = ["support"];

  if (input.repo) {
    const shortName = input.repo.split("/").pop() ?? input.repo;
    labels.push(`repo:${shortName}`);
  } else {
    labels.push("triage");
  }

  if (input.severity) {
    labels.push(`severity:${input.severity}`);
  }

  return labels;
}
