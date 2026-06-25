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

## Current state (as of 2026-06-24)

**Labels is DONE end-to-end** (PRs #12–#13): `Label` entity (name, hex color
`@Matches(/^#[0-9A-Fa-f]{6}$/)`), project-scoped (`@ManyToOne` Project), ManyToMany
with Task (`@JoinTable` on Task side, junction `task_labels`); `labelIds?: number[]` in
create/update task DTOs; CRUD endpoints (`GET/POST /projects/:id/labels`,
`PATCH/DELETE /labels/:id`) with project-membership access checks; `'labels'` added to
`findAll` and `findOne` relations in TasksService; `findAll` in LabelsService uses
`findBy({ project: { id } })` (plain object doesn't work — must nest id); boards
`findOne` now includes `relations: ['project']` so BoardPage gets projectId without URL
params. Frontend: label picker in TaskModal (colored toggle pills), chips on task cards,
label filter in filter bar, LabelsPanel CRUD modal with color picker, axios interceptor
fixed (refresh-token queue pattern — single refresh for concurrent 401s).

**Global Search is DONE** (PRs #6–#10) — see previous context for full details.

**ROADMAP.md is the plan of record — keep ticking it.**

**Next up (order agreed): Layer 1 finish:**
1. **Board filters** ← next. Assignee/type/priority/label filters — mostly frontend
   (Claude writes). Backend already has all data; just needs filter UI + query params
   if server-side filtering is wanted (discuss first).
2. **Notifications** — entity + triggers on @mentions/assignment; **reuse BullMQ** for
   async fan-out; bell UI. Email later (Layer 3).

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
- TypeORM `findBy({ relation: fullEntityObject })` does **not** filter correctly —
  always use `findBy({ relation: { id: X } })` (nest the primary key explicitly).
- TypeORM `ManyToOne` on Board/Label: `findOneBy` without `relations` doesn't return
  the related entity — add `relations: ['project']` to `findOne` when you need it.
- Axios parallel 401s → multiple refresh calls (race condition). Fix: shared
  `isRefreshing` flag + queue of waiting promises (see `frontend/src/api/axios.ts`).
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
