# Private Multiplayer diagnostics

The in-game reporter sends schema 1 JSON to `POST /api/diagnostics` over HTTPS.
It does not use the public `/api/report` form. A receipt is returned only after
the SQLite transaction commits with synchronous FULL. The receipt includes the
report ID, storage timestamp, stored digest and SHA256 of the exact upload bytes.

The schema in `lib/diagnostic-schema.ts` is the ingestion contract. Unknown fields,
unconsented bundles, more than 256 events and requests over 256 KiB are rejected.
Credentials, account numbers, addresses and user paths are filtered again on the
server. Installed mod metadata means manifests found in the profile; it does not
assert that every installed mod is active.

The machine-readable contract is generated at `api/diagnostics/1.json`.
Run `node --experimental-strip-types tools/diagnostics-schema.mjs` after schema changes.
CI checks that this generated file matches the server validator.

## Deploy

1. Mount a dedicated named volume at `/var/lib/mt2-diagnostics` on the existing
   Support application. Keep one replica. The image initializes this directory
   for the unprivileged application user with mode 700.
2. The image sets `DIAGNOSTICS_DIRECTORY=/var/lib/mt2-diagnostics`. Data must not be placed
   under `public`. There is no temporary-storage fallback.
3. The image sets `DIAGNOSTICS_PUBLIC_ISSUES=true` for the anonymized issue outbox.
   The existing server-only GitHub integration creates those issues.
4. Deploy the checked Support source. Keep the existing environment values.

On the first start, a random 32-byte admin key is written to `admin-token` on the
private volume with mode 600. An optional `DIAGNOSTICS_ADMIN_TOKEN` of at least 43
characters overrides it. Never place this key in a mod, browser URL or public log.
Maintainers with existing server access can read it inside the container and set
it in a local environment for the management CLI. There is no public report reader.

## Maintainer access

`GET /api/diagnostics/admin` requires `Authorization: Bearer <admin key>`.
It lists failure groups, affected builds, sampled sessions and issue outbox state.
Use `?id=<report UUID>` to inspect one private report, or
`?session=<diagnostic session UUID>` to correlate Host and guest reports.
The API sends no-store responses. A report number alone does not grant access.

With the private admin key in `MT2_DIAGNOSTICS_TOKEN`, use:

```sh
node tools/diagnostics.mjs groups
node tools/diagnostics.mjs report <report-UUID>
node tools/diagnostics.mjs session <session-UUID>
```

These commands emit structured private JSON for maintainers and agents. The token
is never a command-line argument or URL parameter. Keep report output private.

Reports expire after 30 days. Startup and a minute-based maintenance task prune
expired rows. Abuse counters retain only a keyed IP hash for at most two hourly
buckets; report bodies contain no IP. The ingress proxy must replace X-Real-IP.
The store permits 20 new reports per IP per hour and 10000 retained reports.
An identical retry does not consume another report or quota entry.

Each error signature queues at most one public issue. The issue contains only a
validated product version and failure signature. Descriptions, logs, report IDs
and session IDs stay private. An uncertain GitHub create is reconciled by reading
existing issues, never blindly repeated. An unresolved create remains visible as
`unknown` for manual handling. Successful-session counts describe opt-in samples,
not the entire player population.

## Local verification

Run `node --experimental-strip-types --test tests/diagnostics.test.mjs`,
`npx tsc --noEmit` and `npm run build`. The Multiplayer workspace contains
`_drafts/multiplayer-reporting/test_http.py`, which checks the real compiled routes
with disposable local data and never uses production credentials or GitHub writes.
