# AGENTS.md

## Project

Next.js 14 (App Router) + TypeScript port of the original Vite/React CRM.
Tailwind CSS for styling, TanStack Query for data fetching/caching.

## Structure

- `src/app` — routes. `(auth)` and `(dashboard)` are route groups, each with
  their own `layout.tsx`. Route groups don't affect the URL path.
- `src/components` — mirrors the original `src/components` tree
  (contacts/, deals/, leads/, invoices/, notifications/, shared/, layout/, ui/).
- `src/entities` — TypeScript types ported from `base44/entities/*.jsonc`.
- `src/api` — typed fetch wrappers, one file per resource.
- `src/lib` — cross-cutting utilities (auth context, query client, app params, cn/format helpers).
- `src/hooks` — `useIsMobile`, `useSize`.
- `middleware.ts` — edge-level route protection.

## Layout / routing migration notes

- `AppShell.jsx` → replaced by `src/app/(dashboard)/layout.tsx` +
  `src/components/layout/DashboardShell.tsx`. No custom app-level layout
  component is used for page composition anymore; Next.js layouts own it.
- `ProtectedRoute.jsx` → replaced by the server-side auth check in
  `src/app/(dashboard)/layout.tsx` (redirects before any page HTML is sent)
  plus `middleware.ts` for an edge-level check.
- `AuthLayout.jsx` → `src/app/(auth)/layout.tsx`.
- `ScrollToTop.jsx` → removed. Next.js's App Router already resets scroll
  position on navigation.
- `PageNotFound.jsx` → `src/app/not-found.tsx`.
- React Router `<Routes>`/`<Route>` → Next.js file-based routing
  (`pages/Foo.jsx` → `app/foo/page.tsx`), with `pages/InvoiceDetail.jsx`
  becoming the dynamic route `app/(dashboard)/invoices/[invoiceId]/page.tsx`.
- `main.jsx` + `App.jsx` → `src/app/layout.tsx` (root layout) +
  `src/app/providers.tsx` (client-side QueryClientProvider/AuthProvider).

## Commands

```bash
npm install
npm run dev        # start dev server on :3000
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint
```

## Conventions

- All new files are TypeScript (`.ts`/`.tsx`), no `.jsx`/`.js` in `src/`.
- Client components are explicitly marked `"use client"` — everything else
  (layouts doing auth checks, simple pages with no interactivity) stays a
  server component by default.
- Data fetching goes through `src/api/*` wrappers, not ad-hoc `fetch` calls
  in components.
