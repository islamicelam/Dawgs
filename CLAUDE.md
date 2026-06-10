# Dawgs — Claude Context

Jira/Trello-style app (NestJS 11 + TypeORM/Postgres backend, React 19 + Vite frontend,
docker-compose). Learning project: the user wants to **adopt as many production
technologies as possible**. Full feature plan lives in `ROADMAP.md` — keep it updated
(tick boxes, refresh "Current status") after each feature.

## Working agreement (important — coach mode)

The user is **learning backend** and writes it himself. Claude **never writes backend
business logic for him** — Claude explains, directs, reviews diffs, and catches bugs.
Claude **writes the frontend entirely** (user never touches frontend). Communicate in
Russian; code/comments in English.

Per feature: 1) design — discuss, Claude proposes options + recommendation, user decides;
2) backend entity/DTO/service — user writes, Claude reviews; 3) unit tests — user writes,
Claude gives cases/assertions; 4) wiring/endpoints — user writes, Claude hints;
5) frontend — Claude writes.

Rules: small chunks, verify each before next; commit after each logical sub-step (don't
let work pile up); always run lint+build+test locally before commit; branch off `main` →
PR → CI gates merge → delete branch after merge. Explain concepts junior-level when asked;
give exact commands when the user asks "how do I...".

## Current state (as of 2026-06-10)

**In progress: Global Search (Elasticsearch + Redis + BullMQ), overkill-by-design.**

Done & merged (PRs #6–#8): ES 9.4.2 + Redis in docker-compose; SearchModule
(`backend/src/search/`) with ES client + `ensureIndex()` mapping (title/description=text,
priority=keyword); transactional outbox (`SearchOutbox` entity, written in same TX as task
create/update/delete in TasksService); OutboxRelay (`@Interval(5000)`, polls unprocessed
rows, enqueues BullMQ jobs, `jobId: outbox-<id>` for dedup, attempts:3 + exp backoff);
SearchProcessor (WorkerHost) — UPSERT: fetch task from DB with relations
`['board','board.project','status']` → `indexTask()` (doc `_id` = task.id, includes
projectId for access filtering); DELETE: `removeFromIndex()` (swallows 404);
`reindexAll()` + admin-only `POST /search/reindex` backfill.

**Next (user is implementing now): Phase 2 — `GET /search?q=`** in SearchService/Controller:
- multi_match over `title^2`/`description`, `fuzziness: 'AUTO'`, highlight
- **access scoping (critical security):** non-ADMIN → fetch user's project ids from
  `projectRepo` (members contains user), `filter: [{ terms: { projectId } }]`; empty
  projects → return `[]`. ADMIN unfiltered. Needs `Project` added to
  `TypeOrmModule.forFeature` in SearchModule.
- Verify BOTH: finds tasks AND does not leak other users' tasks.

**Then: Phase 3 — frontend search UI (Claude writes):** header search box, ~300ms
debounce, results dropdown with ES highlight, navigate to task/board, loading/empty states.

**After search is done: remind the user to update README and ROADMAP.md** (he asked).

## How to run / verify

Dev loop: `docker compose up -d db redis elasticsearch`, then `cd backend && npm run
start:dev` (native, hot-reload). Root `.env` is loaded via `envFilePath: ['.env','../.env']`;
for native runs hosts must be `localhost` (overridden in gitignored `backend/.env`), in
Docker they're service names (`db`/`elasticsearch`/`redis`). Full-docker runs need
`--build` (frontend image is a static nginx build; also rebuild backend after changes).

Pre-commit checks (run exactly like CI — no `--fix`):
`cd backend && npm run build && npx eslint "{src,apps,libs,test}/**/*.ts" && npm test`;
frontend: `npm run lint && npm run build`. ES sanity:
`curl http://localhost:9200/tasks/_search?pretty`; outbox:
`docker compose exec db psql -U islam -d dawgs -c 'SELECT * FROM search_outbox;'`.

## Hard-won gotchas (recur — check these in review)

- TypeORM `relations: []` takes **relations only**, never columns (runtime error).
- TypeORM column `type: 'string'` doesn't exist → `'varchar'`. Same trap in ES: no
  `'string'` type → `text`/`keyword`.
- Inside `manager.transaction()`, every write must go through `manager`, and
  `manager.save(plain-object)` needs the entity class: `manager.save(Task, payload)`
  (`as Task` cast doesn't survive runtime).
- ES client major version must match server major (v9 client ↔ v9 server). After changing
  a dep version always `npm install` and commit the lock file (CI runs `npm ci`).
- BullMQ custom `jobId` can't be a pure integer string → prefix (`outbox-3`).
- ES ports: app talks HTTP to **9200**; 9300 is internal node transport — never use it.
- Jest: `moduleNameMapper ^src/(.*)$ → <rootDir>/$1`; mock repo with echo saves
  (`save: (x) => Promise.resolve(x)`), `manager.transaction: jest.fn((cb) => cb(manager))`
  (no needless `async` — lint `require-await` fails CI).
- React: `react-hooks/set-state-in-effect` — no sync setState in effect body or
  `.then/.finally`; wrap in async IIFE with try/finally.
- User's known pitfalls: committing to an already-merged branch (always branch fresh off
  pulled `main`); files created outside `src/` escape lint/test scope; never put plain
  `APP_PORT`-style server vars into Vite (`VITE_`-prefixed, separate concern).
- Strict typing required — no `any` in production code (user called this out); `as any`
  acceptable only in test mocks.

## Security debt (tracked in ROADMAP; the .env Gemini key may be compromised — there's a
pending task chip to audit git history; default user role is ADMIN; CORS wide open;
AI endpoint lacks input length cap).
