# Clearview CRM — Frontend

A production-quality, multi-tenant CRM SPA. Built as a real, runnable app — not a design document.

## Stack

- **React 19 + TypeScript** on **Vite** (bundled by TanStack Start)
- **TanStack Router** — file-based routes with tenant-scoped URLs (`/:tenantSlug/...`)
- **Redux Toolkit** — feature slices with `createAsyncThunk` + `createEntityAdapter`
- **Axios** — single configured instance with request/response interceptors
- **Tailwind CSS v4** — semantic tokens, light + dark modes
- **shadcn/ui + Radix** primitives for accessible components
- **@dnd-kit** — Kanban drag-and-drop
- **Recharts** — dashboard charts
- **Mock API layer** — a custom Axios adapter routes requests to an in-memory DB persisted to `localStorage`. No external backend needed.

## Getting started

```bash
bun install     # or npm install
bun run dev     # or npm run dev
```

Open the preview and sign in with:

- **Email**: `demo@crm.app`
- **Password**: `demo`

Two tenants are seeded: `acme` and `globex`. Switch between them from the workspace picker in the top-left of the app shell.

## Features

- **Auth** — login screen, JWT persisted to `localStorage`, injected via axios interceptor, protected routes via TanStack's `_app` pathless layout.
- **Multi-tenant** — user belongs to multiple tenants. Tenant switcher in the top nav resets tenant-scoped Redux slices (`leads/deals/invoices/notifications`) and navigates to `/:tenantSlug/...`.
- **Leads** — table with search + status filter, row → drawer edit, bulk select → bulk assign / delete, create dialog.
- **Deals** — Kanban board grouped by stage with drag-and-drop (**optimistic** update, rollback on API failure), toggle to table view, deal detail with tabs (Overview, Activity, Contacts, Invoices).
- **Invoices** — list + editable detail with line items and **live-computed totals**, status stepper (Draft → Sent → Paid → Overdue).
- **Dashboard** — KPI cards, line chart (revenue trend), bar chart (deals by stage), recent activity feed.
- **Notifications** — bell in top bar with unread count, popover list, mark-as-read + mark-all-read.
- **Settings** — profile, users & roles table (with role dropdowns), tenant branding (name + primary color).
- **Theme toggle** — light / dark / system, persisted, applied via Tailwind `dark:` variant.
- **Responsive** — desktop sidebar (collapsible to icon rail), mobile off-canvas drawer.

## Folder structure

```
src/
  api/
    client.ts               # single axios instance + interceptors
  lib/
    mockDb.ts               # seeded in-memory database (localStorage-persisted)
    mockAdapter.ts          # custom axios adapter → routes to mock DB
    utils.ts                # cn() helper
  store/
    index.ts                # configureStore + tenantReset action
    hooks.ts                # typed useAppSelector / useAppDispatch
  features/
    auth/         slice.ts  # login/logout + token
    tenant/       slice.ts  # active tenant slug
    leads/        slice.ts  # entities + thunks + selectors
    deals/        slice.ts  # + optimistic move / revert + view toggle
    invoices/     slice.ts
    notifications/slice.ts
    ui/           slice.ts  # theme + sidebar collapse
  components/
    AppProviders.tsx        # Redux Provider, theme sync, api configurator
    AppShell.tsx            # sidebar + top bar (tenant switcher, search, bell, theme, user)
    NotificationsBell.tsx
    ui-kit.tsx              # PageHeader, EmptyState, TableSkeleton, KPISkeleton
    ui/                     # shadcn primitives (Button, Input, Sheet, Dialog, ...)
  routes/
    __root.tsx              # HTML shell + AppProviders
    index.tsx               # redirect (token → /:slug/dashboard, else /login)
    login.tsx
    _app.tsx                # auth-gated pathless layout
    _app.$tenantSlug.tsx    # tenant layout — mounts AppShell
    _app.$tenantSlug.index.tsx      # /:slug → /:slug/dashboard
    _app.$tenantSlug.dashboard.tsx
    _app.$tenantSlug.leads.tsx
    _app.$tenantSlug.deals.tsx
    _app.$tenantSlug.deals.$dealId.tsx
    _app.$tenantSlug.invoices.tsx
    _app.$tenantSlug.invoices.$invoiceId.tsx
    _app.$tenantSlug.notifications.tsx
    _app.$tenantSlug.settings.tsx
  styles.css                # design tokens (indigo / slate, light + dark) + Tailwind v4
```

## Architecture notes

**Axios layer** — one configured instance in `src/api/client.ts`. A request interceptor injects the bearer token (from Redux) and `X-Tenant-Id` header (derived from active tenant). A response interceptor calls `onUnauthorized` on 401 (dispatches `logout()` and navigates to `/login`), shows a toast on 5xx, and shows a permission toast on 403. The `mockAdapter` short-circuits all requests to the in-memory DB — swap `adapter: mockAdapter` for a real base URL to point at a live backend.

**Redux slices** — every feature owns `slice.ts` with the canonical shape:
`createEntityAdapter().getInitialState({ status, error, ...extras })`. One `createAsyncThunk` per operation, with `pending` / `fulfilled` / `rejected` handled consistently. `createEntityAdapter` gives normalized state and O(1) single-item updates, so a stage change on one deal doesn't re-render the whole Kanban.

**Optimistic Kanban** — `moveDealOptimistic` reducer applies the stage change instantly. If the awaited `updateDeal` thunk rejects, `revertStage` restores the previous stage and a toast surfaces the failure. (Trigger a rollback by setting the `x-simulate-failure` header in the axios call.)

**Tenant reset** — the root reducer intercepts `app/tenantReset` and strips leads/deals/invoices/notifications slices back to their `initialState`, then the tenant slice writes the new slug and the axios interceptor picks up the new `X-Tenant-Id` automatically.

**Loading / empty / error states** — every screen uses skeleton components matching the final layout (never a full-screen spinner), an inline retry button on error, and an actionable empty state.

## Swapping the real backend in

1. Delete `src/lib/mockAdapter.ts` and `src/lib/mockDb.ts`.
2. In `src/api/client.ts` remove the `adapter: mockAdapter` line and set `baseURL` from `import.meta.env.VITE_API_URL`.
3. Adjust the resource paths in each feature's thunks if your API differs from the assumed `/:tenantSlug/leads`, `/:tenantSlug/deals`, etc.

## Scripts

- `bun run dev` — start Vite dev server
- `bun run build` — production build
- `bun run lint` — ESLint
