// Server-side configuration. Read at runtime (not build) so that the Docker
// image can be built without secrets and configured via Dokploy env vars.
// IMPORTANT: never import this module from a Client Component.

export const serverConfig = {
  githubToken: process.env.GITHUB_TOKEN ?? "",
  githubOwner: process.env.GITHUB_OWNER ?? "DooDesch",
  githubRepo: process.env.GITHUB_REPO ?? "Support",
  githubProjectNumber: Number.parseInt(
    process.env.GITHUB_PROJECT_NUMBER ?? "3",
    10,
  ),
  // Falls back to Cloudflare's "always passes" test secret so the app works in
  // local development. MUST be overridden with a real secret in production.
  turnstileSecret:
    process.env.TURNSTILE_SECRET_KEY ??
    "1x0000000000000000000000000000000AA",
} as const;

export function assertGithubConfigured(): void {
  if (!serverConfig.githubToken) {
    throw new Error("GITHUB_TOKEN is not configured");
  }
}
