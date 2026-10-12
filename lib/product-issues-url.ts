import type { PublicRepo } from "./github";

export function productIssuesUrl(repo: PublicRepo): string {
  if (!repo.pendingCatalog) return `${repo.url}/issues`;
  const query = `is:issue is:open label:"repo:${repo.name}"`;
  return `https://github.com/DooDesch/Support/issues?q=${encodeURIComponent(query)}`;
}
