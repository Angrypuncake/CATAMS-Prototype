# Project Progress Report

## Project Overview
This is a Next.js (App Router) frontend with role‑based dashboards and an Admin ETL pipeline for tutor allocations and UC budgeting. The backend is exposed via Next.js API routes for Admin (import/preview/commit/discard/history/rollback, overview), Tutor allocations, UC overview/dashboard, user lookup, and auth. Tooling includes Tailwind, Jest, Husky hooks, and a Postgres layer accessed through a small DB lib.

## Routes & Pages (Interpreted)

### App Pages
- `/` – Landing/root shell and global layout.
- `/portal` – Entry portal page.
- `/dashboard/admin` – Admin dashboard: high‑level metrics and links to ETL controls.
- `/dashboard/assistant` – Assistant view: operational snapshot.
- `/dashboard/coordinator` – Coordinator view: oversight controls.
- `/dashboard/tutor` – Tutor dashboard hub.
- `/dashboard/tutor/allocations` – Tutor allocations list; includes UI components for comments/requests.
- `/dashboard/tutor/allocations/[id]` – Allocation detail page.
- `/admin/import` – Upload CSV into staging and preview results.
- `/admin/import/[stagingId]` – Staging batch detail view.
- `/admin/import/history` – Past staged/committed runs.
- `/database_test`, `/allocations_test`, `/uc-test` – Utility/test pages.

### API Routes (Next.js `/app/api/*`)
- `GET /api/admin/overview` – Totals and sample user/role table.
- `POST /api/admin/import` – Upload CSV → returns `stagingId`.
- `GET /api/admin/preview?stagingId=` – Grid/validation/timetable preview for a batch.
- `POST /api/admin/import/commit` – Commit a staging batch.
- `POST /api/admin/discard` – Discard a staging batch.
- `GET /api/admin/history` – History of staged/committed runs.
- `POST /api/admin/rollback` – Roll back a committed run.
- `GET /api/tutor/allocations` – Paged allocations; optional `userId` filter.
- `GET /api/uc/overview` and `GET /api/uc/dashboard` – Budget and UC snapshots.
- `GET /api/user/[id]` – User lookup.
- `POST /api/auth/login` – Auth endpoint (scaffolded).

## Current Progress
- **Dashboards & Pages present:** Admin, Assistant, Coordinator, Tutor views and detail pages for allocations are scaffolded.
- **Admin Overview implemented:** Returns totals and a 10‑row user/role table (joined across `user_role`, `users`, `role`). 
- **ETL preview implemented:** Preview endpoint computes raw grid, lightweight validation (missing fields), and a timetable aggregation with totals.
- **Full Admin ETL surface present:** Import, Commit, Discard, History, Rollback routes exist for the pipeline.
- **UC endpoints present:** `uc/overview`, `uc/dashboard` routes are defined.
- **Schema & ETL scripts drafted:** SQL seeds for staging → production tables, v2 ETL inserts to `teaching_activity`, `session_occurrence`, `allocation`, and a Python Excel→staging loader script.
- **Tooling in place:** Husky pre‑commit (lint‑staged) and pre‑push (tests), Jest + Testing Library scaffolding, Tailwind/PostCSS configured, TypeScript/ESLint set up.

## Next Steps
- **Wire real DB**: Confirm environment and connection pooling; finish query implementations for all API routes and map to page UIs.
- **Auth & RBAC**: Implement session auth and role‑based visibility (docs mark auth TBD). Gate admin routes/pages.
- **File upload hardening**: Size/type checks, CSV schema validation, and clear error flows in the import UI.
- **End‑to‑end flows**: Happy path for upload → preview → commit → history/rollback, visible from `/admin/import` pages.
- **Tutor workflows**: Hook comments/requests components to API; implement pagination/filters for allocations.
- **Observability**: Error logs (server/client), loading/empty states, optimistic/rollback UX.
- **Testing**: API unit tests, page component tests, and minimal E2E happy‑path for ETL.

## Risks & Issues
- **Auth/Authorization gap**: Backend docs note “Auth TBD”; without RBAC, sensitive ETL/Admin surfaces are exposed behind only the UI.
- **Data correctness during ETL**: Staging→commit pipeline must handle duplicates, conflicts, and idempotency; rollback safety needs verification.
- **Schema drift**: SQL schemas and API shape must stay aligned with frontend expectations (e.g., timetable aggregation fields).
- **Large files/performance**: Preview and history queries may be heavy for large CSVs; require pagination and server‑side limits.
- **Operational UX**: Clear error states for missing `stagingId`, invalid CSV columns, and conflicting runs.