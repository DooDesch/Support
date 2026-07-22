import { cached } from "./ttl-cache";
import {
  listOpenIssues,
  listSupportIssuesByLabel,
  type RepoIssue,
} from "./github";
import type { Product } from "./products";

const TTL_MS = 10 * 60 * 1000;
const MAX_ISSUES = 6;

// Open issues for a product, merged from the product repo and the central
// Support repo. Returns null when nothing could be fetched at all; the page
// then hides the section instead of failing.
export async function getKnownIssues(
  product: Product,
): Promise<RepoIssue[] | null> {
  try {
    return await cached(
      `known-issues:${product.repo.fullName}`,
      TTL_MS,
      async () => {
        const [owner, repo] = product.repo.fullName.split("/");
        const results = await Promise.allSettled([
          listOpenIssues(owner, repo, MAX_ISSUES),
          listSupportIssuesByLabel(`repo:${product.repo.name}`, MAX_ISSUES),
        ]);
        const fulfilled = results.filter(
          (r): r is PromiseFulfilledResult<RepoIssue[]> =>
            r.status === "fulfilled",
        );
        if (fulfilled.length === 0) {
          throw (results[0] as PromiseRejectedResult).reason;
        }

        const seen = new Set<string>();
        return fulfilled
          .flatMap((r) => r.value)
          .filter((issue) => {
            if (seen.has(issue.url)) return false;
            seen.add(issue.url);
            return true;
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, MAX_ISSUES);
      },
    );
  } catch (error) {
    console.error(
      `Failed to load known issues for ${product.repo.fullName}:`,
      error,
    );
    return null;
  }
}
