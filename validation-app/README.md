# DurableAgents validation app

A small headless task tracker with a real PostgreSQL store. It is a **test application**, not a platform implementation: it does not implement Gateway service lifecycle tools, checkpoint restoration, or cancellation. Fixtures are sample application data, never fabricated provider results.

## Requirements and safety

- Node.js **22.x** and npm; direct dependency `pg` is pinned exactly and the complete dependency graph is locked in `package-lock.json`.
- For DB/API execution: PostgreSQL **16.6**, or Docker with Compose v2. The Compose images pin Node **22.22** and PostgreSQL **16.6**; these are explicit reproducibility baselines, not floating `latest` tags.
- Domain unit, repair, and feature qualification require **only Node**. They do not import `pg`, require `npm ci`, connect to PostgreSQL, or pretend to verify persistence.
- Both published Compose ports bind only `127.0.0.1`. Default direct-process HTTP binding is also `127.0.0.1`. Public sample DB credentials are local-only, not production secrets. The API deliberately has no authentication and must not be exposed publicly.
- Never commit `.env` or `node_modules`. No environment file is loaded implicitly. `.env.example` contains only public local defaults.

## Fast current-capability domain baseline

From a clean checkout on Node 22:

```sh
npm test
npm run test:acceptance
```

These are deterministic, DB-independent checks. Report them as **domain verification only**. The separate `npm run test:feature` command intentionally fails on the baseline because it defines a requested qualification feature, not baseline functionality. It is not included in `npm test` and must not be described as passing before implementation.

## Real PostgreSQL: direct-process smoke

Use a disposable local development database. Integration tests require a database role with `CREATE SCHEMA` permission; each test creates a random `test_*` schema and drops only that schema. They do not truncate or reset the `public` app schema, do not silently skip, and fail clearly if `TEST_DATABASE_URL` is absent. Do not point them at production.

```sh
npm ci --ignore-scripts
# Starts only the real database, not a fake in-memory substitute.
docker compose up -d --wait db
export DATABASE_URL='postgres://validation:validation_local_only@127.0.0.1:55432/validation_app'
export TEST_DATABASE_URL="$DATABASE_URL"
npm run migrate
npm run migrate
npm run seed
npm run seed
npm test
npm run test:acceptance
npm run test:integration
npm start
```

`npm start` is a foreground process. Keep it in its own terminal, or hand its argv, environment, readiness URL, and lifetime to an actual service manager. Migrations and seeding are intentionally separate from direct startup; do not seed on every API restart. Run the following requests from another terminal:

```sh
curl --fail http://127.0.0.1:3000/health
curl --fail http://127.0.0.1:3000/ready
curl --fail 'http://127.0.0.1:3000/tasks?limit=2'
curl --fail -X POST http://127.0.0.1:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Persist across API restart","description":"Record the returned id"}'
# Replace TASK_ID with the actual returned UUID.
curl --fail -X PATCH http://127.0.0.1:3000/tasks/TASK_ID \
  -H 'Content-Type: application/json' -d '{"status":"in_progress"}'
curl --fail -X PATCH http://127.0.0.1:3000/tasks/TASK_ID \
  -H 'Content-Type: application/json' -d '{"status":"done"}'
curl --fail http://127.0.0.1:3000/tasks/TASK_ID
```

For a manual persistence smoke, record the real task ID, stop only the API with Ctrl-C, run `npm start` again, and GET the same ID. PostgreSQL must remain running. Integration tests also retrieve newly inserted rows from a separate pool and a new HTTP server sharing that real database; this is actual persistence testing, not a claim of platform cross-call service support.

The server responds to SIGINT/SIGTERM, stops accepting new connections, closes idle HTTP connections, drains active requests, and closes its pool; a 10-second shutdown deadline bounds stuck work. Configuration: `DATABASE_URL` (required), `DATABASE_SCHEMA` (default `public`; existing schema required), `HOST` (default `127.0.0.1`), `PORT` (default `3000`). Custom schemas must be explicitly created by the operator before migration; identifiers must match `[a-z_][a-z0-9_]{0,62}`. Never place real connection strings in task output.

## Full Docker/Compose execution

```sh
docker compose up --build -d --wait
# Insert five deterministic sample tasks; repeated execution preserves edits.
docker compose exec api node scripts/seed.js
curl --fail http://127.0.0.1:3000/ready
curl --fail 'http://127.0.0.1:3000/tasks?limit=2'
# API restart does not remove DB data.
docker compose restart api
# Wait for /ready to return 200 before the next request.
docker compose ps
docker compose stop
```

The API container applies migrations before starting, but does not automatically seed. DB data remains in the named Compose volume through `stop`, `restart`, and normal `down`. `docker compose down --volumes` **destroys local app data**; use it only when deliberately resetting this disposable project. Host port 55432 is PostgreSQL; host port 3000 is HTTP. To run host integration tests against Compose, set `TEST_DATABASE_URL` as above and run `npm ci --ignore-scripts && npm run test:integration` on Node 22. Do not start both host API and Compose API on port 3000.

For parallel local campaigns, set `DATABASE_PORT` and `API_PORT` on every Compose invocation, for example `DATABASE_PORT=56491 API_PORT=30591 docker compose -p det1491-validation up -d --wait db`. Update the host-side database URL to the selected port. Do not stop an unrelated listener to reclaim a default port.

## HTTP contract

All responses are JSON. Request bodies for POST/PATCH require `application/json`; malformed JSON, unknown fields, and invalid values return 400; wrong media type returns 415; bodies larger than 16 KiB return 413. Resource IDs must be UUIDs. A missing row returns 404. Unexpected DB errors return 500 without exposing raw errors or connection strings.

| Method | Route | Meaning |
| --- | --- | --- |
| GET | `/health` | Process liveness only; does not imply DB health. |
| GET | `/ready` | 200 only when the configured DB is reachable and the `tasks` table exists, otherwise 503. |
| POST | `/tasks` | `{ "title": "...", "description": "..." }`; description optional, status starts `pending`; returns 201. |
| GET | `/tasks/:id` | Retrieve the actual persisted task. |
| PATCH | `/tasks/:id` | Any nonempty subset of title, description, status; returns updated row. |
| GET | `/tasks?limit=20&status=pending&cursor=...` | Paginated `{ items, nextCursor }`; status and cursor optional. |

Title is trimmed and must contain 1–120 JavaScript characters; description is trimmed and limited to 2000, including empty strings. Client-supplied IDs, timestamps, and create-status fields are rejected. IDs are random UUIDs, timestamps are UTC ISO-8601 strings. Readiness checks table availability, not seed presence or every schema constraint.

Transitions:

- `pending` → `in_progress` or `canceled`.
- `in_progress` → `pending`, `done`, or `canceled`.
- `done` and `canceled` are terminal.
- Setting a status to itself is idempotent. Invalid transitions return 409; valid title/description edits remain allowed for terminal rows.

Updates lock the row in a transaction so competing terminal transitions cannot both succeed. Pagination sorts by `(created_at ASC, id ASC)` and uses an exclusive cursor, including when timestamps tie. Timestamps use millisecond precision to match Node Date serialization. Limit is an integer 1–100, default 20. Repeat the same status filter on subsequent pages. Cursors encode a position, not an authorization token or snapshot; concurrent creates/updates are not snapshot-isolated across requests. Unknown or repeated list parameters and malformed cursors return 400.

## Migrations and realistic backfill

`migrations/001_tasks.sql` defines constraints and pagination indexes. The runner uses one transaction, a schema-scoped advisory lock, migration identity, and SHA-256 checksums. Re-running an unchanged migration is safe; editing an applied migration fails instead of silently changing deployed history. Add a new ordered migration to the runner for a future schema change. Migration SQL itself uses `IF NOT EXISTS`; it does not drop data or blindly rewrite existing tables.

`fixtures/tasks.json` contains five deterministic sample tasks, including tied timestamps and each lifecycle status. `npm run seed` inserts their fixed IDs/timestamps in one transaction with `ON CONFLICT DO NOTHING`, preserving existing records and user edits. It does not fabricate successful agent runs, service handles, or provider output.

## Qualification campaigns and fail-first work

`qualification/tasks.json` contains task prompts, prerequisites, allowed changes, protected checks, and acceptance commands. It is an app-level specification, **not** an assertion that Gateway natively imports this JSON. Launch tasks through the actual supported Gateway/DurableAgents interface.

Use a fresh baseline checkout for each task. Before launching repair/feature work, the campaign owner should copy the original acceptance files outside the writable agent checkout (or retain their committed hashes), run those trusted bytes after the task, and verify protected files and package scripts were unchanged. Never count a rewritten/skipped test as acceptance. Capture real stdout, exit codes, task IDs, and repository identity.

### Baseline

Run `npm test` and `npm run test:acceptance` unchanged. This proves private checkout plus domain execution, not DB integration. Run `baseline-real-postgres` separately only when a real service is provisioned.

### Repair: completion regression

Main's baseline is correct. The deliberately separate fixture introduces a small realistic defect: a worker can start but cannot complete a task.

```sh
npm run fixture:apply
npm run test:acceptance  # Must fail BEFORE repair.
# Launch the manifest's repair task; only src/domain.js may change.
npm test
npm run test:acceptance  # Must pass AFTER repair with unchanged checks.
```

`fixture:apply` refuses if it cannot find the exact baseline; it does not change tests. For manual fixture cleanup *before* an agent repair, `npm run fixture:restore` reverses only the exact introduced defect and refuses unrelated source. After a successful repair, no restore is needed. Record fail-first evidence before giving the agent the task; simply restoring a fixture is not evidence that an agent diagnosed and repaired it.

### Feature: task label normalization

The `feature-normalize-task-labels` task adds an exported pure domain function, not HTTP/DB label storage. Its separate unchanged `qualification/acceptance/feature.test.js` intentionally fails before implementation. Labels must trim/lowercase, validate ASCII `[a-z0-9-]{1,32}`, deduplicate, sort, allow at most ten unique entries, and avoid mutating input. Run `npm run test:feature` before and after; existing unit/repair checks must continue to pass. This is an explicitly unimplemented qualification request, not an unfinished baseline API feature or a mocked persistence test.

### Persistent services, restoration, and cancellation

The manifest also records future end-to-end scenarios. **The current platform does not expose `service_start`, `service_status`, or `service_stop`.** A single shell command, a background process, local Compose smoke, or mocked handle cannot substitute for independently owned platform services surviving multiple tool calls.

Persistent-service acceptance must eventually record real handles, create a row in one tool call, retrieve it in another, restart only the API, retrieve the same row, and clean up owned services. Restoration additionally needs actual checkpoint/restore plus supported service reattachment and retained DB storage; task state alone is not proof of service restoration. Cancellation can be qualified as a task-state operation with a supported cancellation API, but owned-service cleanup remains unproven until lifecycle tools and ownership semantics exist. These unsupported prerequisites must be reported as blocked, not silently passed. No production deployment, platform service implementation, credential change, or limit increase is part of this repository.

## DET-1491 verified baseline

The initial local qualification used Node 22.18.0 and actual PostgreSQL 16.6 on loopback port 56491. Migrations and deterministic seed each ran twice successfully; six domain tests, one repair acceptance test, and six real-database integration tests passed. A separately launched API returned healthy/ready, created an actual task, and persisted its pending → in_progress → done transitions. The repair fixture produced a nonzero acceptance failure before restoration and passed with the unchanged check afterwards. Feature acceptance failed as intended because that separate requested feature was not implemented.

The owner selected the already-authorized `ryanrdetzel/Blackjack` Gateway repository for hosted tasks instead of adding a private-repository credential. Hosted qualification uses only synthetic fixture code/data on a dedicated `qualification/det1491` branch under `validation-app/`; Blackjack's default branch and game are not changed. This private repository retains the fixture baseline. An allowlist entry alone does not prove private native checkout, and local PostgreSQL does not prove hosted cross-tool-call service support.
