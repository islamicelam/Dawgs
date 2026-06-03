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
- [ ] **Labels** — new entity, ManyToMany with Task (TypeORM relations, `@JoinTable`)
- [ ] **Board filters** — assignee / type / priority / label (frontend state)
- [ ] **Global search** — Postgres `ILIKE` first; upgrade later (Layer 2 / backlog)
- [ ] **Notifications** — entity + triggers on @mentions / assignment (bell UI)

### Layer 2 — AI (Gemini already wired)
- [ ] AI **break down an Epic** into user stories (structured output)
- [ ] AI **summarize a comment thread**
- [ ] AI **generate acceptance criteria** for a story
- [ ] **Semantic search** — **pgvector** + embeddings
- [ ] AI **auto-classify** task type (bug / feature / chore)

### Layer 3 — Collaboration (real-time)
- [ ] **WebSockets** (NestJS Gateways / Socket.IO) — live board updates
- [ ] **Presence** ("Alice is viewing this task") — **Redis** pub/sub
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
- **Auth hardening:** refresh-token rotation + logout, RBAC with **CASL**, **Google OAuth** (Passport)
- **API:** rate limiting (`@nestjs/throttler`), optional **GraphQL** alongside REST
- **DB:** **TypeORM migrations** (retire `synchronize` for prod), read replicas later
- **Observability:** **pino** logging, **Sentry**, **Prometheus + Grafana**, **OpenTelemetry**
- **Testing:** **Testcontainers** (e2e on real Postgres), **Playwright** (frontend E2E), Vitest + RTL
- **Frontend:** **TanStack Query** (server state), **Zustand** (client state), **Storybook**, **i18n**, optimistic updates
- **Payments (if SaaS):** **Stripe** subscriptions
- **Infra/CD:** Docker dev override (hot-reload), deploy workflow, later k8s / Helm

---

## Current status

- **Done:** priority/dueDate (backend + tests + CI + frontend UI), GitHub Actions CI
- **Next up:** Layer 1 → **Labels**, then **Board filters**

> Keep this file alive: tick boxes and update "Current status" after each feature.
