// Operator data for the Impressum (§ 5 DDG, § 18 Abs. 2 MStV) and the
// controller section of the privacy notice. Fill in every field of `operator`.
// The build fails while a field is empty (see lib/legal.ts), so an incomplete
// Impressum cannot deploy.
export const operator = {
  // Full name, for example "Max Mustermann".
  name: "",
  // Street and house number, for example "Musterstraße 1".
  street: "",
  // Postal code, for example "12345".
  postalCode: "",
  // City, for example "Musterstadt".
  city: "",
  // Country as it appears on both pages, for example "Deutschland".
  country: "",
  // Contact email address, for example "mail@example.com".
  email: "",
};

// Facts for the privacy notice that are not in this repository. These fields
// are optional: an empty value keeps the privacy notice on a neutral wording.
export const privacyFacts = {
  // TODO: The repository does not name the company that hosts the Dokploy
  // server. Add the name and address of the hosting company, for example
  // "Example GmbH, Beispielweg 1, 12345 Beispielstadt, Deutschland".
  // Empty = the privacy notice names no hosting company.
  hostingProvider: "",

  // TODO: The repository does not show if the reverse proxy (Traefik on
  // Dokploy) writes access logs, or how long it keeps them. Add the number of
  // days after which log entries are deleted.
  // null = the privacy notice says that entries are deleted when they are no
  // longer necessary, without a number of days.
  logRetentionDays: null as number | null,
};

// TODO: Confirm that stats.doodesch.de (Umami) runs on your own server and
// how long Umami keeps its data. The repository only says "self-hosted Umami".
//
// TODO: Confirm on https://www.dataprivacyframework.gov that Cloudflare, Inc.
// (Turnstile) and GitHub, Inc. are still certified under the EU-US Data
// Privacy Framework. The privacy notice uses this certification as the legal
// basis for the transfer to the USA.
