import { cached } from "./ttl-cache";
import { listPublicRepos, type PublicRepo } from "./github";

// The list of public repos changes rarely; 10 minutes keeps the form snappy
// and stays well within GitHub's rate limits.
const TTL_MS = 10 * 60 * 1000;

// Shared by the /api/repos route and the server-rendered product pages so
// both hit GitHub at most once per TTL window.
export function getCachedRepos(): Promise<PublicRepo[]> {
  return cached("public-repos", TTL_MS, listPublicRepos);
}
