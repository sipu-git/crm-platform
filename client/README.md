# CRM (Next.js port)

A Next.js 14 (App Router) + TypeScript port of the original Vite/React CRM
front end (Contacts, Deals, Leads, Invoices, Automation, Settings).

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

## What changed from the React (Vite) version

- **Routing**: `react-router-dom` routes → Next.js file-based routing under
  `src/app`. Two route groups: `(auth)` for login/register/password flows,
  `(dashboard)` for the authenticated app.
- **Layout**: the custom `AppShell.jsx` component is gone. Its job — sidebar,
  topbar, page chrome — now lives in `src/app/(dashboard)/layout.tsx` and
  `src/components/layout/DashboardShell.tsx`, using Next.js's native nested
  layouts instead of a component rendered inside route elements.
- **Route protection**: `ProtectedRoute.jsx` is gone. Auth is now checked
  server-side in `(dashboard)/layout.tsx` (via the session cookie) before any
  protected page ever renders, plus `middleware.ts` for a second edge-level
  check.
- **Language**: every file is TypeScript. Data models (`base44/entities/*.jsonc`)
  were ported to typed interfaces in `src/entities/`.
- **Data fetching**: `src/api/*` are typed fetch wrappers used with
  TanStack Query (`@tanstack/react-query`), same library as before.

See `AGENTS.md` for the full file-by-file migration map.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build & serve
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

## Notes

- The `/api/*` endpoints referenced in `src/api/*` and `src/lib/auth-context.tsx`
  (e.g. `/api/auth/login`, `/api/contacts`) are not implemented here — wire
  them up as Next.js Route Handlers (`src/app/api/**/route.ts`) or point
  `NEXT_PUBLIC_API_BASE_URL` at your existing backend.
- UI primitives in `src/components/ui` are minimal, dependency-free
  implementations (no Radix/shadcn) so the project builds standalone. Swap
  in shadcn/ui if you want the original component set.
