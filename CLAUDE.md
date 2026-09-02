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

## Current state (as of 2026-09-01)

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

**WebSockets + Presence is DONE** (PRs #15–#16, merged): `BoardGateway` (NestJS
Gateway / Socket.IO, `/board` namespace), `WsJwtGuard` verifies the JWT from the
httpOnly `access_token` cookie on handshake (parses the raw cookie header with the
`cookie` package — `cookie-parser` doesn't run on the WS upgrade request, it's
Express-only). `TasksService` emits `task.created/updated/deleted/reordered` **after**
each transaction resolves (never inside the callback — clients must never see an event
for a write that could still roll back). Frontend: `useBoardSocket` hook + presence
avatars deduped by `userId` in `BoardPage`'s header.

**UI redesign — two waves, first merged, second in progress:**
1. *Linear-style redesign* (PRs #17–#18, **merged**) — neutral+indigo palette,
   light/dark toggle (`useTheme` hook, `tailwind.config.js` `darkMode: 'class'`, inline
   pre-paint script in `index.html` to avoid a flash of the wrong theme), two-column
   `TaskModal` (content + metadata sidebar instead of one long stacked form), applied
   across Board, Projects, Login, Settings.
2. *Full Dawgs brand book* (branch `feat/dawgs-brand`, **committed, not yet merged**)
   — swapped the placeholder palette for the real brand: exact color ramps overridden
   directly in `tailwind.config.js` (`neutral`/`indigo`/`sky`/`emerald`/`amber`/`red`
   all remapped to brand hex — existing utility classes like `bg-neutral-950` or
   `text-sky-500` auto-repaint everywhere with **zero** per-component edits), self-hosted
   Inter (`@fontsource/inter`), logo mark (`public/mark.svg` + `favicon.svg`, four
   rounded bars + a base — dog-ear silhouette), soft-outline button style (border + 8%
   tint, no solid fills — see the six class fragments in `constants/ui.ts`), a strict
   "accent budget" (indigo appears **only** on the mark, the active filter, and primary
   buttons — chips/avatars/hover-states all went neutral), Phosphor icons
   (`@phosphor-icons/react`) replacing emoji throughout, brand microcopy swaps.

**Google OAuth login — branch `feat/google-oauth`, in progress, not merged, not wired
into `AuthModule` yet.** Design decided: match existing users by `googleId` first, fall
back to auto-link by `email` (Google verifies email ownership, so this is safe), else
create a new password-less user. Done so far:
- `User.password` and `User.googleId` both `string | null` (nullable; `googleId`
  additionally `unique: true`)
- `AuthService.findOrCreateGoogleUser()` implements the match/link/create logic above
- `AuthService.login()` / `UsersService.update()` both null-guard `user.password`
  before `bcrypt.compare` (a Google-only user has none)
- `GoogleStrategy` (`passport-google-oauth20`) resolves straight to a `User` entity
  inside `validate()` (injects `AuthService`, doesn't just pass the raw Google profile
  through to the controller)

**Still to do before this can merge:**
1. Register `GoogleStrategy` in `AuthModule.providers` (not wired in yet)
2. `AuthController` routes: `GET /auth/google` + `GET /auth/google/callback`
   (`@Public() @UseGuards(AuthGuard('google'))`), reusing the existing
   `setCookies()`/`signTokens()` helpers so `/me`/`/refresh`/the guard need zero changes
3. Frontend (Claude's job): a "Sign in with Google" control that does a real
   `window.location` redirect to `/auth/google` (not an axios call — OAuth needs a real
   browser navigation to Google's consent screen), plus an `/oauth/callback` landing
   route that calls `getMe()` and stores `me` like the existing login flow

**Notifications — not started.** Next up after Google OAuth ships (entity + triggers
on @mentions/assignment, reuse BullMQ for async fan-out; can now also push live via the
already-built `BoardGateway`/per-user room instead of only polling — see "How to run").

**ROADMAP.md is the plan of record — keep ticking it.**

## How to run / verify

Dev loop: `docker compose up -d db redis elasticsearch`, then `cd backend && npm run
start:dev` (native, hot-reload). Root `.env`/`.env.example` is the **canonical** file —
documents every variable, and is the **only** one `docker compose`'s `backend` service
reads (`env_file: - .env`; `backend/.env` is never mounted into the container, only
`backend/src` is). `backend/.env`/`backend/.env.example` is an optional, gitignored
override layer used **only** for native (non-Docker) runs, and **only** for the handful
of vars that actually differ between "backend in Docker" and "backend on the host":
`DB_HOST`, `ELASTICSEARCH_NODE`, `REDIS_HOST` → `localhost` (`envFilePath:
['.env','../.env']` loads `backend/.env` first as override, root `.env` as fallback).
Everything else — secrets, `GOOGLE_CLIENT_ID`/`SECRET`/`CALLBACK_URL`, etc. — belongs in
root `.env` only (`GOOGLE_CALLBACK_URL` is the same value either way — it's what the
*browser* gets redirected to, not an internal service address, so it isn't part of the
native/Docker split). Full-docker (`docker compose up -d --build`) needs `--build` and
has **no hot-reload at all**: the frontend image is a static nginx build, and the
backend Dockerfile does a one-time `npm run build` + `node dist/main.js` (no
`--watch`) — it's a "run the whole stack once" mode, not a dev loop.

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
- TypeORM can't infer a column's SQL type from a union TS type (`string | null`) via
  reflect-metadata — it collapses to `Object` at runtime and TypeORM throws
  `DataTypeNotSupportedError: Data type "Object"`. Any nullable column typed as
  `X | null` needs an **explicit** `type:` in `@Column()` (plain `string`/`number`
  without `| null` infer fine on their own — see `refreshTokenHash`/`googleId` vs the
  `password` bug this caused).
- Editor errors like `Property 'x' has no initializer and is not definitely assigned`
  on decorator-populated classes (TypeORM entities, `@WebSocketServer()` fields) are
  often a false alarm from the editor's TS server, not the real build —
  `npm run build` only enforces `strictPropertyInitialization` if it's actually set in
  `tsconfig.json` (this project has `strictNullChecks: true` but not `strict: true`).
  Fix once at the config level (`"strictPropertyInitialization": false`) instead of
  sprinkling `!` on every field.
- `ConfigService.get<T>()` returns `T | undefined` — breaks strict option types that
  want a plain `T` (e.g. a passport strategy constructor's options object; the
  resulting TS error is confusing and mentions an unrelated missing property because
  overload resolution fails silently). Use `getOrThrow<T>()` for required config —
  fails fast at boot with a clear error instead of passing `undefined` into a
  third-party library.
- Installing new deps (`npm install ...`) while the Vite dev server is already running
  can leave a stale pre-bundled deps cache on an already-open browser tab — symptoms
  look like a real React bug ("Invalid hook call", "Cannot read properties of null
  (reading 'useContext')") but it's just a disconnected stale HMR client. Fix: kill the
  dev server, `rm -rf node_modules/.vite`, restart, and load the page in a **fresh**
  browser tab (not just `navigate` on the old one — that can still serve cached JS).

## Security debt (tracked in ROADMAP; the .env Gemini key may be compromised — there's a
pending task chip to audit git history; default user role is ADMIN; CORS wide open;
AI endpoint lacks input length cap).
