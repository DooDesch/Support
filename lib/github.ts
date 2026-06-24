import { Octokit } from "octokit";
import { serverConfig, assertGithubConfigured } from "./env";

let octokitInstance: Octokit | null = null;

function getOctokit(): Octokit {
  assertGithubConfigured();
  if (!octokitInstance) {
    octokitInstance = new Octokit({ auth: serverConfig.githubToken });
  }
  return octokitInstance;
}

export interface PublicRepo {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
}

// Minimal shape we rely on from both the user-repos and org-repos endpoints.
type RawRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  pushed_at?: string | null;
  fork?: boolean;
  archived?: boolean;
  private?: boolean;
};

// Lists the owner's public repos PLUS the public repos of each configured org
// (e.g. DooDesch-Mods), sorted by "interaction" (stars + forks + open issues)
// and, as a tiebreaker, most recently pushed. Archived repos and forks are
// excluded as they are rarely the target of a support report.
export async function listPublicRepos(): Promise<PublicRepo[]> {
  const octokit = getOctokit();

  const sources: Array<Promise<RawRepo[]>> = [
    // The /users/{username}/repos endpoint only ever returns PUBLIC repos,
    // even when authenticated. "owner" restricts to repos owned by the user.
    octokit.paginate(octokit.rest.repos.listForUser, {
      username: serverConfig.githubOwner,
      type: "owner",
      per_page: 100,
    }),
    // Each org's public repos. A failure for one org must not break the list.
    ...serverConfig.githubOrgs.map((org) =>
      octokit
        .paginate(octokit.rest.repos.listForOrg, {
          org,
          type: "public",
          per_page: 100,
        })
        .catch((error) => {
          console.error(`Failed to list repos for org "${org}":`, error);
          return [] as RawRepo[];
        }),
    ),
  ];

  const raw = (await Promise.all(sources)).flat();

  // De-duplicate by full name (defensive; user/org sets normally don't overlap).
  const byName = new Map<string, RawRepo>();
  for (const r of raw) {
    if (r.private || r.fork || r.archived) continue;
    if (!byName.has(r.full_name)) byName.set(r.full_name, r);
  }

  const score = (r: RawRepo) =>
    (r.stargazers_count ?? 0) +
    (r.forks_count ?? 0) +
    (r.open_issues_count ?? 0);

  return [...byName.values()]
    .sort((a, b) => {
      const diff = score(b) - score(a);
      if (diff !== 0) return diff;
      const pa = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
      const pb = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
      return pb - pa;
    })
    .map((r) => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description ?? null,
      url: r.html_url,
      stars: r.stargazers_count ?? 0,
      language: r.language ?? null,
    }));
}

export interface CreatedIssue {
  url: string;
  number: number;
}

export async function createReportIssue(params: {
  title: string;
  body: string;
  labels: string[];
}): Promise<CreatedIssue> {
  const octokit = getOctokit();

  const { data } = await octokit.rest.issues.create({
    owner: serverConfig.githubOwner,
    repo: serverConfig.githubRepo,
    title: params.title,
    body: params.body,
    labels: params.labels,
  });

  // Best-effort: add the new issue to the user's Projects v2 board. A failure
  // here (e.g. missing `project` scope) must not fail the whole submission.
  try {
    await addIssueToProject(octokit, data.node_id);
  } catch (error) {
    console.error("Failed to add issue to project board:", error);
  }

  return { url: data.html_url, number: data.number };
}

let projectIdCache: string | null = null;

async function getProjectId(octokit: Octokit): Promise<string | null> {
  if (projectIdCache) return projectIdCache;

  const query = `
    query ($login: String!, $number: Int!) {
      user(login: $login) {
        projectV2(number: $number) { id }
      }
    }
  `;

  const result = await octokit.graphql<{
    user: { projectV2: { id: string } | null } | null;
  }>(query, {
    login: serverConfig.githubOwner,
    number: serverConfig.githubProjectNumber,
  });

  projectIdCache = result.user?.projectV2?.id ?? null;
  return projectIdCache;
}

async function addIssueToProject(
  octokit: Octokit,
  issueNodeId: string,
): Promise<void> {
  const projectId = await getProjectId(octokit);
  if (!projectId) return;

  const mutation = `
    mutation ($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item { id }
      }
    }
  `;

  await octokit.graphql(mutation, { projectId, contentId: issueNodeId });
}
