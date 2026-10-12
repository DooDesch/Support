import type { PublicRepo } from "./github";

// Support forms can be prepared before a product's source repository is public.
const PENDING_CABIN_PRODUCTS = [
  "ModSettings",
  "ClearRules",
  "EscapeFix",
  "GraphicsProfiles",
  "ShortEvents",
  "FastTurns",
  "Rejoin",
];

export function withPendingProducts(repos: PublicRepo[]): PublicRepo[] {
  const known = new Set(repos.map((repo) => repo.fullName));
  const pending = PENDING_CABIN_PRODUCTS
    .map((name): PublicRepo => ({
      name: `TheCabinGame-${name}`,
      fullName: `DooDesch-Mods/TheCabinGame-${name}`,
      description: null,
      url: `https://github.com/DooDesch-Mods/TheCabinGame-${name}`,
      stars: null,
      language: null,
      pendingCatalog: true,
    }))
    .filter((repo) => !known.has(repo.fullName));
  return [...repos, ...pending];
}
