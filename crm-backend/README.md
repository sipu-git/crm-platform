# CRM Backend — Modular Monolith (Express + Prisma + PostgreSQL + TypeScript)

## Setup

```bash
npm install
cp .env.example .env        # fill in your PostgreSQL connection string + JWT secrets
npx prisma migrate dev --name init
npm run prisma:seed         # creates a demo tenant + admin user (admin@demo.com / Password123!)
npm run dev
```

Server runs on `http://localhost:5000` (health check at `/health`).

> Note: `npx prisma generate` needs to reach `binaries.prisma.sh` to download its query
> engine — this works fine on a normal machine/CI, it just isn't reachable from the
> sandboxed environment this project was scaffolded in, so it hasn't been run here.

## Architecture — Modular Monolith

One deployable Express process, internally split into independent modules that only
communicate through the shared **event bus** (`src/core/event-bus`), never by importing
each other's services or repositories directly.

```
src/
├── core/                  # shared infrastructure, no business logic
│   ├── config/            # env var loading
│   ├── database/          # single Prisma client instance
│   ├── event-bus/         # in-process EventEmitter — the seam between modules
│   ├── middleware/        # authGuard, rbac, tenantContext, errorHandler
│   └── utils/             # ApiError, asyncHandler, jwt helpers
├── modules/
│   ├── auth/               # register, login, refresh, logout
│   ├── contact/            # Contact CRUD
│   ├── lead/                # Lead capture, dedup, qualify, convert-to-contact
│   ├── deal/                # Kanban pipeline, stage transitions, won/lost events
│   ├── activity/            # polymorphic timeline (lead/deal/contact)
│   ├── invoice/              # invoice CRUD + auto-draft on deal.won (listener)
│   ├── notification/         # Socket.io + REST, dispatch + listeners
│   └── audit/                 # immutable audit trail, listens broadly
├── app.ts                 # Express app assembly, route mounting, listener registration
└── server.ts               # HTTP + Socket.io bootstrap
```

Each module follows the same internal shape:
```
module/
├── module.routes.ts        # Express router
├── module.controller.ts    # thin HTTP layer — parses input, calls service, returns JSON
├── module.service.ts       # business logic, emits domain events
├── module.repository.ts    # Prisma queries, private to this module
├── module.schema.ts        # Zod validation + inferred types
└── module.listener.ts      # (only on some modules) subscribes to other modules' events
```

## How modules talk to each other

**Rule: never import another module's service/repository directly.** Instead:

```typescript
// deal.service.ts emits an event, knows nothing about who's listening
eventBus.emit('deal.won', { dealId, tenantId, dealType });

// invoice.listener.ts reacts, knows nothing about deal.service's internals
eventBus.on('deal.won', async (payload) => {
  await invoiceRepository.createDraftFromDeal(...);
});
```

This means:
- `invoice` module can be extracted into its own microservice later — swap the
  `event-bus` implementation for Redis pub/sub or a message broker, and nothing in
  `deal` needs to change, since it never knew `invoice` existed.
- `notification` and `audit` modules are intentionally "broad listeners" — that's
  their whole job (turning events into user-facing notices / compliance records).

## Multi-tenancy & security

- Every tenant-scoped table has a `tenantId` column; every repository method takes
  `tenantId` as its first argument and filters by it — enforced by convention here.
  For stronger defense-in-depth at scale, add a Prisma `$use` middleware that injects
  the `tenantId` filter automatically (noted as a TODO — not added yet to keep the
  query signatures explicit and readable while the codebase is still small).
- `authGuard` verifies the JWT and attaches `req.auth` (userId, tenantId, role).
- `tenantContext` confirms tenant is present and exposes `req.tenantId`.
- `requireRole(...)` enforces RBAC at the route layer (e.g. `invoice.markPaid` and
  the entire `audit` router are Admin/Manager-only) — never rely on the frontend
  hiding a button as the only protection.

## Key design decisions worth knowing

- **Deal-Won → Invoice chain runs via the event bus, not a direct call** — if you
  later need this to be a single atomic DB transaction (e.g. also reserving
  inventory), wrap the reads/writes across modules in `prisma.$transaction(...)`
  inside a dedicated orchestration point rather than crossing module boundaries.
- **Invoice `markPaid` is intentionally its own explicit action**, not
  automatically triggered by a payment gateway webhook in this scaffold — wire your
  payment provider's webhook handler to call `invoiceService.markPaid` when you
  add one.
- **Lead dedup** rejects a duplicate email with a 409 rather than silently merging —
  decide in the frontend whether to surface that as "log an activity on the existing
  lead instead" per the workflow discussed earlier.
- **Audit log is append-only** — no update/delete methods exist on `auditRepository`
  by design.

## Next steps you'll likely want

- Add a Prisma tenant-scoping middleware (`prisma.$use`) for defense-in-depth
- Add rate limiting per tenant (Redis token bucket) once you introduce Redis
- Add the Automation/rule-engine and email-sync modules discussed earlier — they
  follow the exact same module shape, just add `automation/` and `integration/`
  folders with the same five-file pattern
- Add integration tests per module (Jest + Supertest), hitting a test database
