# Team Shiksha — Multi-Tenant RSVP

A challenge submission demonstrating a multi-tenant system with strict data isolation across three role tiers.

> **Status:** complete.

---

## Problem

The system enforces three access levels with server-side isolation on every request:

- **Superadmin** — can view all projects across the entire application.
- **Org Admin** — full access to all projects within their specific organization.
- **Project Member** — restricted entirely to the specific projects they belong to; cannot view or access any other project.

Cross-tenant data access is impossible regardless of UI state — every API route re-authorizes against the session and applies tenant-scoping inside the use case layer.

---

## Run locally

Requirements: **Node 22+**, **npm 10+**.

```bash
npm install
npx prisma migrate dev           # creates SQLite db at prisma/dev.db
npm run db:seed                  # seeds orgs, users, projects, memberships
npm run dev                      # http://localhost:3000
```

Required environment variables (already set in `.env` for local dev):

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="..."                 # any non-empty string for local
JWT_ACCESS_EXPIRY="1h"
```

Run tests:

```bash
npm test                         # unit + integration (server + client)
npm run test:watch
```

Reset and re-seed the database:

```bash
npm run db:reset                 # drops + re-migrates + re-seeds
```

---

## Demo logins

All accounts share the same password: **`demo1234`**. Run `npm run db:seed` to (re)create them.

| Role                          | Email                  | Memberships              |
|-------------------------------|------------------------|--------------------------|
| Superadmin                    | `super@demo.test`      | (all projects, all orgs) |
| Org A — Admin                 | `admin-a@demo.test`    | (all Org A projects)     |
| Org A — Member (multi)        | `member1-a@demo.test`  | Org A Project 1, 2       |
| Org A — Member (none)         | `member2-a@demo.test`  | _none — edge case_       |
| Org B — Admin                 | `admin-b@demo.test`    | (all Org B projects)     |
| Org B — Member                | `member-b@demo.test`   | Org B Project 1          |

The seed also creates an **Org A — Orphan Project** with no members, to verify Org Admins still see it but Members do not.

**Note on memberships:** The problem statement describes *who can view what*, not how memberships are managed. In line with that scope, memberships are seeded; the app intentionally does not expose a UI to add/remove members. To exercise different membership combinations, edit `prisma/seed.ts` and run `npm run db:reset`.

---

## Architecture

Next.js App Router carries both halves: the App Router routes + `src/features/` are the frontend; `src/server/` is the backend that the API route handlers in `src/app/api/` delegate to. Each half follows its own Clean Architecture.

```
src/
├── app/                         # Next.js routes
│   ├── (pages)/                 # user-facing pages
│   └── api/                     # thin route handlers → src/server
├── features/                    # frontend bounded contexts
│   └── <feature>/
│       ├── application/usecases/  # pure TS, no React
│       ├── components/
│       ├── hooks/
│       ├── repositories/        # HTTP adapters
│       └── types/
├── shared/                      # frontend cross-cutting
│   ├── components/{atoms,molecules,organisms,templates,shadcn}/
│   ├── interfaces/
│   ├── providers/               # React DI
│   └── services/
└── server/                      # backend (one repo, two architectures)
    ├── shared/
    │   ├── decorators/          # AuthenticateDecorator, RoleGuardDecorator
    │   ├── domain/              # Result, errors
    │   └── infrastructure/      # JwtSessionManager, HttpRequest/Response
    └── <bounded-context>/
        ├── domain/              # entities, value objects, repo interfaces, errors
        ├── application/use-cases/
        ├── infrastructure/      # Prisma repositories
        └── presentation/        # API mappers, controllers
```

**Layer rules (both halves)**

- Use cases are pure TypeScript. No framework imports (no React in frontend use cases; no Express/Next in backend use cases).
- Mappers are static, pure functions.
- Repositories implement domain-defined interfaces.
- Dependency injection via constructors (backend) and React context (frontend).

---

## Authorization layering

Three composable pieces. The pattern mirrors the `AuthenticateDecorator` convention from the [code-clinic project](https://github.com/) — kept here so the use case remains framework-free while still receiving the actor context it needs to tenant-scope results.

```
HTTP request
   │
   ▼
AuthenticateDecorator   ── verifies JWT cookie, decodes session, 401 on failure
   │
   ▼
RoleGuardDecorator      ── optional; 403 short-circuit for forbidden roles
   │
   ▼
extractor(session, req) ── pure fn → builds typed UseCaseRequest DTO
   │
   ▼
UseCase                 ── pure TS; tenant-scopes the result based on actor fields
                            in the DTO; returns Result.fail(NotFoundError) for
                            cross-tenant reads (no existence leak) or
                            Result.fail(ForbiddenError) for in-scope-but-denied
```

**Why this split:** a decorator can only say yes/no. Tenant-scoping changes *what data is returned* (e.g., `ListProjects` returns different rows per actor), which is business logic — it lives in the use case. JWT verification and role short-circuits are genuinely cross-cutting, so they live in decorators.

**404 vs 403 convention:**

- **404** — cross-tenant access (don't leak existence): an Admin asking for an Org B project, a Member asking for a project they don't belong to.
- **403** — in-scope but lacking the permission: a Member trying to create a project.
- **401** — missing or invalid token.

---

## Vertical slices

Built and shipped one slice at a time. Each slice is end-to-end testable and demoable on its own.

| # | Slice | Status |
|---|-------|--------|
| 0 | Foundations: Prisma schema, seed, decorators, shared domain | ✓ |
| 1 | Login (JWT cookie session) | ✓ |
| 2 | List projects — role-scoped read | ✓ |
| 3 | View project detail — 404 on cross-tenant | ✓ |
| 4 | Create project — role-gated, org-scoped | ✓ |
| 5 | Edit + delete project | ✓ |

---

## How to verify the isolation rules

Log in as each user (see the table above) and check what they see on `/projects`:

| Login as            | What they should see                          |
|---------------------|-----------------------------------------------|
| `super@demo.test`   | All 5 projects across both orgs               |
| `admin-a@demo.test` | 3 projects (all Org A's, including the orphan) |
| `member1-a@demo.test` | 2 projects (the ones they're a member of)    |
| `member2-a@demo.test` | Empty list (no memberships)                  |
| `admin-b@demo.test` | 2 projects (Org B's)                          |
| `member-b@demo.test` | 1 project                                     |

To verify the server enforces isolation independently of the UI:

```bash
# Admin A tries to fetch an Org B project via direct API call → 404
curl -b cookies.txt http://localhost:3000/api/projects/<org-b-project-id>

# Member tries to create a project → 403 (RoleGuard short-circuits)
curl -X POST -b cookies.txt -H 'content-type: application/json' \
  -d '{"name":"x","orgId":"x"}' http://localhost:3000/api/projects
```

The UI hides actions the actor can't take (no "Create Project" button for Members, no Edit/Delete on the detail page), but the server is the source of truth — every endpoint re-authorizes against the JWT cookie and applies tenant filtering inside the use case.

---

## Tech stack

- TypeScript, Next.js (App Router), React 19
- SQLite via Prisma
- JWT (HTTP-only cookie) for sessions
- Tailwind CSS
- Jest + React Testing Library
- npm
