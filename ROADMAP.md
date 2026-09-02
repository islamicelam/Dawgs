# Dawgs — Roadmap & Plan of Action

**Goal:** grow this Jira/Trello-style app into a real product, and deliberately adopt
**as many production technologies as possible** along the way (breadth of tech is a primary goal).

---

## How we work (per feature)

| Phase | Work | Who |
|-------|------|-----|
| 1. Design | schema / API decisions | discuss together; Claude proposes, user decides |
| 2. Backend | entity / DTO / service | **user writes**, Claude reviews |
| 3. Tests | unit tests on the service | **user writes**, Claude directs (cases + assertions) |
| 4. Integration | wiring, endpoints, modules | user writes, Claude hints |
| 5. Frontend | UI, types, API client | **Claude writes it entirely** (user never writes frontend) |

Rules: small chunks, review each before moving on; verify **lint + build + test** before commit;
branch off `main` → PR → let CI gate the merge.

---

## Layers (build in this order)

Each item names the **tech to adopt with it**.

### Layer 1 — Core product basics
- [x] **Priority + due date** on tasks — *done* (badges + overdue highlight)
- [x] **Global search** — *done, overkill edition*: Elasticsearch 9 + Redis + BullMQ,
  transactional outbox, relay + worker, admin reindex, access-scoped `GET /search`
  (fuzziness + highlight), debounced header search UI
- [x] **Labels** — project-scoped `Label` entity, ManyToMany with Task (`@JoinTable`),
  `labelIds` in task DTOs; CRUD endpoints; frontend: picker in TaskModal, chips on
  cards, filter by label, Labels management panel — PRs #12–#13
- [ ] **Board filters** — assignee / type / priority / label (frontend state) ← **next**
- [ ] **Notifications** — entity + triggers on @mentions / assignment (bell UI);
  reuse BullMQ queue infra for async fan-out

### Layer 2 — AI (Gemini already wired)
- [ ] AI **break down an Epic** into user stories (structured output)
- [ ] AI **summarize a comment thread**
- [ ] AI **generate acceptance criteria** for a story
- [ ] **Semantic search** — **pgvector** + embeddings
- [ ] AI **auto-classify** task type (bug / feature / chore)

### Layer 3 — Collaboration (real-time)
- [x] **WebSockets** (NestJS Gateway / Socket.IO, `/board` namespace) — live board
  updates: `task.created/updated/deleted/reordered` broadcast to all clients in a
  project room, `WsJwtGuard` verifies JWT from the httpOnly cookie on handshake
- [x] **Presence** ("who's viewing this board") — in-memory per-gateway
  `Map<projectId, Map<socketId, PresenceUser>>` (no Redis pub/sub yet — single
  backend instance; upgrade path is `@socket.io/redis-adapter` if we scale out);
  frontend shows deduped avatar pills in the board header
- [ ] **Email notifications** — **BullMQ + Redis** queue + **Nodemailer / Resend**
- [ ] Project **activity feed**

### Layer 4 — Process & analytics
- [ ] **Sprints** (entity + lifecycle)
- [ ] **Story points** + velocity, **burndown** charts (**Recharts**)
- [ ] Cross-project **"My tasks"** dashboard
- [ ] Cycle / lead-time metrics (aggregation queries)

### Layer 5 — Growth / onboarding
- [ ] **Invite by link** + onboarding flow
- [ ] Seed **demo data** on signup
- [ ] **Public read-only board** via share link
- [ ] **PWA** (installable + push)

---

## Technology adoption backlog (the "use more tech" goal)

Introduce as features justify them:

- **Caching & queues:** Redis (cache + pub/sub), BullMQ (background jobs)
- **Search:** Postgres full-text / `pg_trgm` → Meilisearch / Elasticsearch; **pgvector** (semantic)
- **Files:** S3 / MinIO uploads (multer), attachments on tasks
- **Auth hardening:** refresh-token rotation + logout ✅, RBAC with **CASL**,
  **Google OAuth** (Passport) — 🚧 in progress, branch `feat/google-oauth`
- **API:** rate limiting (`@nestjs/throttler`), optional **GraphQL** alongside REST
- **DB:** **TypeORM migrations** (retire `synchronize` for prod), read replicas later
- **Observability:** **pino** logging, **Sentry**, **Prometheus + Grafana**, **OpenTelemetry**
- **Testing:** **Testcontainers** (e2e on real Postgres), **Playwright** (frontend E2E), Vitest + RTL
- **Frontend:** **TanStack Query** (server state), **Zustand** (client state), **Storybook**, **i18n**, optimistic updates
- **Payments (if SaaS):** **Stripe** subscriptions
- **Infra/CD:** Docker dev override (hot-reload), deploy workflow, later k8s / Helm

---

## Current status (as of 2026-09-01)

- **Done:** priority/dueDate; CI; **Global Search** (ES 9 + Redis + BullMQ + outbox +
  worker + access-scoped endpoint + frontend) — PRs #6–#10; **Labels** (project-scoped
  CRUD + ManyToMany tasks + frontend picker/chips/filter/panel) — PRs #12–#13;
  **WebSockets + Presence** (`BoardGateway`, `WsJwtGuard`, live task events, presence
  avatars) — PR #15–#16; **UI redesign** (Linear-style neutral+indigo design system,
  light/dark theme toggle, two-column task modal, then the full Dawgs brand book —
  real palette, self-hosted Inter, logo, soft-outline buttons, Phosphor icons,
  accent-budget rule, microcopy) across Board, Projects, Login, Settings —
  PR #17–#19
- **In progress (not merged):**
  - **Google OAuth login** — entity (`password`/`googleId` nullable) + `AuthService`
    (`findOrCreateGoogleUser`: match by `googleId`, fall back to auto-link by email,
    else create) + `GoogleStrategy` merged as a checkpoint (PR #20); still needs
    `AuthModule` wiring, `AuthController` routes, and the frontend "Sign in with
    Google" button + callback page before it actually works end-to-end
- **Tech adopted so far:** Elasticsearch, Redis, BullMQ (queues/workers),
  transactional outbox pattern, GitHub Actions, TypeORM ManyToMany relations,
  Socket.IO / NestJS Gateways, Passport Google OAuth strategy (backend groundwork
  merged, not wired up yet), self-hosted web fonts, Phosphor icon system
- **Next up:** finish **Google OAuth** (`AuthModule` wiring + controller routes +
  frontend button), then Layer 1 → **Board filters** or **Notifications** (BullMQ
  fan-out + bell UI, can now also push live via the existing `BoardGateway` instead
  of only polling)

> Keep this file alive: tick boxes and update "Current status" after each feature.
