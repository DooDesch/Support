// Maps vanity URL slugs like /palvolve to repos. Server-only (uses the
// GitHub-backed repo cache).
import { getCachedRepos } from "./repos-cache";
import type { PublicRepo } from "./github";

// Repo naming convention in the DooDesch-Mods org: "{Game}-{ModName}".
const GAME_PREFIXES = ["Palworld-", "ScheduleOne-", "Mimesis-", "Valheim-"];

// Vanity slugs that don't derive from a repo name via prefix stripping.
// Keys must be lowercase; values are the canonical derived slug.
const SLUG_ALIASES: Record<string, string> = {};

// Path segments that must never be treated as product slugs.
const RESERVED_SLUGS = new Set([
  "api",
  "report",
  "impressum",
  "privacy",
  "datenschutz",
]);

export interface Product {
  slug: string;
  displayName: string;
  repo: PublicRepo;
}

export function deriveSlug(repoName: string): string {
  return displayNameFor(repoName).toLowerCase();
}

function displayNameFor(repoName: string): string {
  const prefix = GAME_PREFIXES.find((p) => repoName.startsWith(p));
  return prefix ? repoName.slice(prefix.length) : repoName;
}

// The repo list is sorted by interaction score, so on a (unlikely) slug
// collision the more active repo wins.
export async function listProducts(): Promise<Product[]> {
  const repos = await getCachedRepos();
  const seen = new Set<string>();
  const products: Product[] = [];
  for (const repo of repos) {
    const slug = deriveSlug(repo.name);
    if (RESERVED_SLUGS.has(slug) || seen.has(slug)) continue;
    seen.add(slug);
    products.push({ slug, displayName: displayNameFor(repo.name), repo });
  }
  return products;
}

// Returns null for unknown or reserved slugs. Throws only when the repo list
// is entirely unavailable (no fresh and no stale cache); callers map that to
// a 404 so a GitHub outage never turns into a 500.
export async function resolveProduct(rawSlug: string): Promise<Product | null> {
  const slug = decodeURIComponent(rawSlug).toLowerCase();
  if (RESERVED_SLUGS.has(slug)) return null;
  const target = SLUG_ALIASES[slug] ?? slug;
  const products = await listProducts();
  return products.find((p) => p.slug === target) ?? null;
}
