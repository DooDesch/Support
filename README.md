# Support (support.doodesch.de)

> 🛟 **Need help or found a bug?** Get support at [support.doodesch.de](https://support.doodesch.de).

Public, multilingual (DE/EN) support portal for DooDesch's projects. Visitors
submit a bug report or feedback; each submission becomes a GitHub issue in this
repository (`DooDesch/Support`) and is automatically added to the user
Project board (#3). Only a short title is required - every other field is
optional and added on demand ("every hint helps").

## Stack (June 2026)

Next.js 16 (App Router) - React 19 - TypeScript 6 - next-intl 4 - Tailwind CSS 4
+ shadcn/ui - react-hook-form - Octokit 5 - Cloudflare Turnstile.

## How it works

- `GET /api/repos` - lists the owner's public repos, sorted by interaction
  (stars + forks + open issues), then most recently pushed. Cached in memory.
- `POST /api/report` - validates input (zod), runs spam checks
  (Cloudflare Turnstile + honeypot + per-IP rate limit + min-time-to-submit),
  creates the GitHub issue (REST), and adds it to Project #3 (GraphQL).
- i18n via next-intl with `/de` and `/en` routes (see `proxy.ts`, formerly
  middleware - renamed in Next.js 16).

## Configuration

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `GITHUB_TOKEN` | Classic PAT with `repo` + `project` scopes (server only) |
| `GITHUB_OWNER` | Repo/Project owner (default `DooDesch`) |
| `GITHUB_REPO` | Repo where issues are created (default `Support`) |
| `GITHUB_PROJECT_NUMBER` | User Project number (default `3`) |
| `GITHUB_ORGS` | Extra orgs whose public repos are listed, comma-separated (default `DooDesch-Mods`) |
| `TURNSTILE_SITE_KEY` | Cloudflare Turnstile public site key |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |

Without a real `GITHUB_TOKEN`, `/api/repos` returns 500 and the repo selector
shows an error - everything else still renders. The Turnstile test keys in
`.env.example` always pass and are for local development only.

## Submitting

Two ways to file a report from the form:

- **Create with GitHub** (primary): builds a prefilled GitHub "new issue" URL and
  opens it. The reporter submits with their own GitHub account, so they are the
  author. Targets the selected public repo (or `DooDesch/Support` when no project
  is chosen). No server/Turnstile involved. Note: labels and Projects v2 cannot be
  set via the URL, so they are handled by the Actions workflow below.
- **Submit anonymously** (fallback): posts to `/api/report`; the server creates the
  issue in `DooDesch/Support` (bot-authored) with labels, adds it to Project #3, and
  is protected by Turnstile + honeypot + rate limit.

### GitHub Actions secret

`.github/workflows/add-to-project.yml` adds every new issue in this repo to user
Project #3 (covers self-created "no project" issues). It needs a repository
**Actions secret** `ADD_TO_PROJECT_PAT` = a classic PAT with `repo` + `project`
scopes (the same value as `GITHUB_TOKEN` works). Without it, the project-add step
is skipped; labeling still runs via the default token.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (output: standalone)
npm run lint
```

## Deploy

Built as a Docker image (`Dockerfile`, `output: "standalone"`) and deployed on
Dokploy at `support.doodesch.de`. Set the environment variables above in the
Dokploy application; auto-deploys on push to `main`.
