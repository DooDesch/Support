// Operator data for the Impressum (§ 5 DDG, § 18 Abs. 2 MStV) and the
// controller section of the privacy notice. Fill in every field of `operator`.
// The build fails while a field is empty (see lib/legal.ts), so an incomplete
// Impressum cannot deploy.
export const operator = {
  // Full name, for example "Max Mustermann".
  name: "Dennis Schmidt",
  // Street and house number, for example "Musterstraße 1".
  street: "Elbringhausen 6",
  // Postal code, for example "12345".
  postalCode: "42929",
  // City, for example "Musterstadt".
  city: "Wermelskirchen",
  // Country as it appears on both pages, for example "Deutschland".
  country: "Deutschland",
  // Contact email address, for example "mail@example.com".
  email: "doodesch+contact@gmail.com",
};

// Facts for the privacy notice that are not in this repository. These fields
// are optional: an empty value keeps the privacy notice on a neutral wording.
export const privacyFacts = {
  // Company that hosts the Dokploy server. Empty = the privacy notice names no
  // hosting company.
  hostingProvider: "Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Deutschland",

  // Traefik on Dokploy writes a JSON access log
  // (/etc/dokploy/traefik/dynamic/access.log). The Dokploy log cleanup job
  // ("0 0 * * *") clears it every day, so an entry is kept for at most 1 day.
  // null = the privacy notice says that entries are deleted when they are no
  // longer necessary, without a number of days.
  logRetentionDays: 1 as number | null,
};

// stats.doodesch.de (Umami) runs in the Dokploy project "Analytics" on the
// same server. Umami keeps its aggregated data until it is deleted by hand.
//
// TODO: Confirm on https://www.dataprivacyframework.gov that Cloudflare, Inc.
// (Turnstile) and GitHub, Inc. are still certified under the EU-US Data
// Privacy Framework. The privacy notice uses this certification as the legal
// basis for the transfer to the USA.

