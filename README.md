# 🐾 DAWGS — Project Management Tool

A Trello-like project management application built with NestJS + React.

---

## Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Backend        | NestJS + TypeORM + PostgreSQL            |
| Frontend       | React + Vite + TypeScript + Tailwind CSS |
| Infrastructure | Docker + Docker Compose                  |

---

## Features

### Core

- **Projects & Boards** — Create projects, organize them into boards
- **Kanban Board** — Drag and drop tasks between columns (statuses)
- **Task Sorting** — Reorder tasks within a single column
- **Statuses** — Each board gets 3 default statuses automatically: `TODO`, `IN_PROGRESS`, `DONE`. You can also create custom statuses per board

### Tasks

- Full CRUD for tasks
- Assign tasks to users
- **Task Description** — with `@user` mention/tagging support
- **Comments** — leave comments on tasks, with `@user` tagging
- **Task History** — full audit log of changes made to a task
- **Subtasks** — add checklist items inside a task with checkbox completion
- **Linked Tasks** — link related tasks to each other

### Planning

- **User Stories** — create and manage user stories
- **Epics** — group user stories and tasks under epics

### Access Control

- JWT-based authentication
- Role system: `USER` and `ADMIN`
- Only admins can **delete** any resource
- Only admins can view **all** projects and boards — regular users only see what is shared with them
- **Refresh tokens** — automatic token refresh; invalidated when a user is deleted

### Users & Settings

- Register / Login
- Profile editing (name, email)
- Password change (requires current password)

---

## Getting Started

### Prerequisites

- Docker & Docker Compose installed
- Node.js 20+ (for local development)

### Environment Setup

Copy the example env files and fill in your values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Key variables:

```
# .env (used by Docker)
DB_HOST=db
DB_PORT=5432
APP_PORT=3001
JWT_SECRET=yourjwtsecret
JWT_REFRESH_SECRET=yourrefreshsecret
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=dawgs
```

```
# backend/.env (used for local dev)
DB_HOST=localhost
...same rest of variables...
```

> ⚠️ Never commit `.env` or `backend/.env` — they are in `.gitignore`

---

## Running the App

### Production (everything in Docker)

```bash
docker compose up -d --build
```

- Frontend: http://localhost:80
- Backend API: http://localhost:3001

### Development (hot reload)

```bash
# Start only the database in Docker
docker compose up db -d

# Run backend locally
cd backend
npm install
npm run start:dev

# Run frontend locally
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
Dawgs/
  backend/        ← NestJS application
  frontend/       ← React application
  pgdata/         ← PostgreSQL data (not committed)
  docker-compose.yml
  .env
  .env.example
```

---

## API Overview

| Resource     | Endpoint                                                                |
| ------------ | ----------------------------------------------------------------------- |
| Auth         | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`         |
| Me           | `GET /users/me`                                                         |
| Projects     | `GET/POST /projects`, `PATCH/DELETE /projects/:id`                      |
| Boards       | `GET/POST /boards`, `PATCH/DELETE /boards/:id`                          |
| Statuses     | `GET/POST /statuses`, `PATCH/DELETE /statuses/:id`                      |
| Tasks        | `GET/POST /tasks`, `PATCH/DELETE /tasks/:id`                            |
| Subtasks     | `GET/POST /tasks/:id/subtasks`, `PATCH /tasks/:id/subtasks/:subtaskId`  |
| Comments     | `GET/POST /tasks/:id/comments`, `DELETE /tasks/:id/comments/:commentId` |
| Task History | `GET /tasks/:id/history`                                                |
| Linked Tasks | `POST /tasks/:id/links`, `DELETE /tasks/:id/links/:linkedId`            |
| Epics        | `GET/POST /epics`, `PATCH/DELETE /epics/:id`                            |
| User Stories | `GET/POST /stories`, `PATCH/DELETE /stories/:id`                        |
| Users        | `GET /users` (admin only)                                               |

---

## Roles & Permissions

| Action                   | USER | ADMIN |
| ------------------------ | ---- | ----- |
| View own projects/boards | ✅   | ✅    |
| View all projects/boards | ❌   | ✅    |
| Create tasks, comments   | ✅   | ✅    |
| Delete anything          | ❌   | ✅    |
| Manage users             | ❌   | ✅    |

---

## Notes

- `pgdata/` stores your database — don't delete it unless you want a clean slate
- After changing JWT payload, users must re-login to get a new token
- Refresh tokens are invalidated automatically when a user is deleted
