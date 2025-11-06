# CATAMS Backend API Reference

> Version: 2025-11-06 · Source: `app/api/*` (Next.js App Router)

This reference consolidates **all backend routes** found under `app/api/…`, replacing and expanding the old `api/contract.md` and `api/curl_suite.md`.

---

## Table of Contents

* [Auth](#auth)
* [Users](#users)
* [Tutor](#tutor)
* [Admin](#admin)

  * [Admin › Allocations](#admin--allocations)
  * [Admin › Tutors](#admin--tutors)
  * [Admin › Paycodes](#admin--paycodes)
  * [Admin › Import / ETL](#admin--import--etl)
  * [Admin › History](#admin--history)
  * [Admin › Discard](#admin--discard)
  * [Admin › Rollback](#admin--rollback)
  * [Admin › Activities](#admin--activities)
* [Allocations](#allocations)

  * [Allocations › Single](#allocations--single)
  * [Allocations › Swap](#allocations--swap)
  * [Allocations › Unscheduled](#allocations--unscheduled)
* [Offerings](#offerings)

  * [Offerings › Core](#offerings--core)
  * [Offerings › Allocations](#offerings--allocations)
  * [Offerings › Budget](#offerings--budget)
  * [Offerings › Requests](#offerings--requests)
* [Requests](#requests)
* [UC](#uc)
* [Claims](#claims)
* [Conventions](#conventions)

---

## Auth

### POST `/api/auth/login`

**Body**

```json
{
  "useremail": "string",
  "password": "string"
}
```

* Accepts email + password. In current demo mode, the password is the **`user_id`** as a string.
* On success sets `auth-token` (HTTP-only cookie, 24h) and returns user identity.

**Response**

```json
{ "success": true, "message": "Login successful", "userId": 123, "email": "u@ex" }
```

### POST `/api/auth/logout`

Clears `auth-token` cookie.

### GET `/api/auth/me`

Reads user context from headers injected by middleware (e.g., `x-user-id`, `x-user-email`, `x-user-roles`).

---

## Users

### GET `/api/users`

List users with optional filters.

**Query Params**

* `q` – free-text over first/last/email
* `role` – restrict by role name (e.g. `tutor`, `admin`, `uc`)
* `limit` – default 1000

**Response**

```json
{ "data": [ { "user_id": 1, "first_name": "...", "last_name": "...", "email": "..." } ] }
```

### GET `/api/users/:id`

Returns basic info for a single user.

### GET `/api/users/:id/roles`

All roles for a user, including attached units.

**Response**

```json
{ "data": [ { "role_name": "uc", "unit_code": "INFO1111", "unit_name": "..." } ] }
```

### GET `/api/users/:id/units`

Distinct units linked to the user (via roles).

---

## Tutor

### GET `/api/tutor/allocations`

Paginated allocations for a (optionally filtered) user.

**Query Params**

* `userId` – filter by tutor
* `page` (default 1), `limit` (1..100)
* Search: `q` (matches unit, activity, tutor name/email, status, location, date/time)
* Sort: `sort` in {`session_date`,`start_at`,`unit_code`,`location`,`hours`,`status`,`activity_type`,`activity_name`}, `dir` in {`asc`,`desc`}

**Response**

```json
{
  "page": 1,
  "limit": 50,
  "total": 123,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "first_name": "...",
      "last_name": "...",
      "email": "...",
      "unit_code": "INFO1111",
      "unit_name": "...",
      "activity_type": "Tutorial",
      "activity_name": "T01",
      "session_date": "2025-08-01",
      "start_at": "10:00:00",
      "end_at": "11:00:00",
      "status": "active",
      "location": "...",
      "note": "..."
    }
  ]
}
```

### GET `/api/tutor/allocations/:id`

Single allocation detail with joins.

### GET `/api/tutor/requests`

Current user’s submitted requests (paginated).

**Response**

```json
{
  "page": 1,
  "limit": 50,
  "total": 3,
  "data": [
    {
      "requestId": 7,
      "type": "claim",
      "status": "pending_ta",
      "reason": "...",
      "createdAt": "2025-08-20T10:30:00Z",
      "relatedSession": "INFO1111 Tutorial (Mon 14:00–16:00)"
    }
  ]
}
```

---

## Admin

### Admin › Overview

#### GET `/api/admin/overview`

* Returns overall counts and a table of users with roles + per-role unit counts.

---

### Admin › Allocations

#### GET `/api/admin/allocations`

Paginated, filterable list of **all** allocations.

**Query Params**

* Pagination: `page`, `limit`
* Free-text search: `q`
* Sort: `sort` in {`date`,`start_at`,`unit_code`,`unit_name`,`activity_type`,`activity_name`,`status`,`mode`,`hours`}, `dir` in {`asc`,`desc`}
* Exact filters: `unit_code`, `unit_name`, `activity_type`, `activity_name`, `status`, `user_id`, `mode`
* Exclusion: `exclude_user_id`

**Response**

```json
{ "page": 1, "limit": 25, "total": 999, "data": [ { "id": 1, "user_id": 5, "first_name": "...", "mode": "scheduled", "hours": 2, "unit_code": "...", "activity_type": "Tutorial", "status": "active", "note": "...", "paycode_id": "TU2" } ] }
```

#### PATCH `/api/admin/allocations/:id`

Advanced update + propagation for an allocation.

**Body (selected keys)**

```json
{
  "user_id": 5,
  "paycode_id": "TU2",
  "status": "active",
  "note": "Bring markers",
  "session_date": "2025-09-10",
  "start_at": "10:00:00",
  "end_at": "12:00:00",
  "location": "Carslaw 157",
  "propagate_fields": ["tutor","paycode","start","end","note","status","location"],
  "propagate_notes_mode": "overwrite",
  "propagate_dow": "Mon",
  "propagate_occurrence_ids": [1001,1002]
}
```

* **Rules**: If any of `session_date/start_at/end_at` are provided, **all three are required** and the allocation must be scheduled.
* **Propagation**: optionally apply selected fields to a set of occurrences (same activity), with optional weekday rebase.

**Response**

```json
{ "ok": true, "row": { /* refreshed row with joins */ } }
```

---

### Admin › Tutors

#### GET `/api/admin/tutors`

* Filters: `q` over name/email, `unit_code` to restrict to a unit.
* Returns distinct tutors, ordered by name/email.

#### GET `/api/admin/tutors/:id`

Single tutor profile with simple allocation count aggregate.

---

### Admin › Paycodes

#### GET `/api/admin/paycodes`

Returns list of paycodes and descriptions.

---

### Admin › Import / ETL

#### POST `/api/admin/import`

Upload **CSV/XLSX** into a **staging batch**.

**Form Data**

* `file=@allocations.csv | .xlsx`

**Behavior**

* Creates `import_batch` and inserts rows into `allocations_staging` (max 2000 rows per upload).
* Returns `stagingId` and a small preview.

#### GET `/api/admin/preview?stagingId={id}`

Returns raw preview, validation counts, and a timetable aggregation for the batch.

#### POST `/api/admin/import/commit`

Commits a staging batch by running the DB ETL function, then marks the batch as `committed`.

**Body**

```json
{ "stagingId": 42 }
```

#### GET `/api/admin/history?limit=50`

* Lists recent **staged batches** and **import runs** with totals.

#### POST `/api/admin/discard`

Discard a **staged** batch (no committed runs allowed).

**Body**

```json
{ "batchId": 42 }  // alias: { "stagingId": 42 }
```

#### POST `/api/admin/rollback`

Rollback a **committed** import run via DB function.

**Body**

```json
{ "runId": 9 }
```

---

### Admin › Activities

#### GET `/api/admin/activities/:id/occurrences?futureOnly=1`

List occurrences for an activity; optionally restrict to future dates.

**Response**

```json
{ "data": [ { "occurrence_id": 1, "session_date": "2025-09-01", "status": null } ] }
```

---

## Allocations

### Allocations › Single

#### GET `/api/allocations/:id`

Full detail for a specific allocation (joins user, activity, unit offering, course unit).

#### PATCH `/api/allocations/:id`

Patch an allocation’s **occurrence** fields and optionally update `allocation.status`.

**Body**

```json
{ "hours": 2.0, "note": "…", "location": "…", "status": "active" }
```

#### DELETE `/api/allocations/:id`

Soft-cancel an allocation by setting `status = 'cancelled'`.

### Allocations › Swap

#### PATCH `/api/allocations/swap`

Swap tutors between two allocations and mark both as `swapped`.

**Body**

```json
{ "allocA_id": 101, "allocB_id": 202 }
```

### Allocations › Unscheduled

#### POST `/api/allocations/unscheduled`

Create an **unscheduled** allocation (e.g., Marking, Consultation).

**Body**

```json
{
  "offeringId": 123,
  "tutorId": 456,
  "hours": 6,
  "activityType": "Marking",   // default
  "note": "…"
}
```

* Maps `activityType` → paycode, ensures a matching `teaching_activity` with `mode='unscheduled'`, creates an occurrence, then an allocation.

#### GET `/api/allocations/unscheduled?offeringId=…&activityType=Marking[&tutorId=…][&status=…]`

List unscheduled allocations for an offering (optionally filter by tutor and status).

---

## Offerings

### Offerings › Core

#### GET `/api/offerings/:offeringId`

Returns offering identity (unit code/name, year, session, budget).

### Offerings › Allocations

#### GET `/api/offerings/:offeringId/allocations`

All scheduled allocations for the offering (ordered by date/time).

### Offerings › Budget

#### GET `/api/offerings/:offeringId/budget/total`

Returns the configured budget for the offering.

#### GET `/api/offerings/:offeringId/budget/allocations`

Calculates **allocated amount** (`hours × paycode rate`) for current FY.

#### GET `/api/offerings/:offeringId/budget/claims`

Returns **total claimed amount** for the offering.

### Offerings › Requests

#### GET `/api/offerings/:offeringId/requests`

Returns approval queue lines (request type/status, session timing, requester/reviewer names).

---

## Requests

### POST `/api/requests`

Create a tutor request of type one of: `claim | swap | correction | cancellation | query`.

**Headers**

* `x-user-id` (required)

**Body**

```json
{
  "allocationId": 999,
  "requestType": "claim",
  "requestReason": "…",
  "details": { "payload": "schema varies by type" }
}
```

* Duplicate protection: rejects open duplicates for same requester+allocation+type (status in `pending_ta` | `pending_uc`).

**Response**

```json
{ "success": true, "requestId": 123 }
```

### GET `/api/requests?allocationId=…`

List **open** requests for an allocation (optionally scoped to current user via header `x-user-id`).

### PATCH `/api/requests`

Update a request (status, reviewer, reviewer_note, request_reason, and JSON `details` shallow-merge or clear).

**Body (examples)**

```json
{ "requestId": 7, "requestStatus": "approved_uc" }
{ "requestId": 7, "reviewer": 55, "reviewerNote": "…" }
{ "requestId": 7, "requestType": "claim", "details": { "hours": 2.5 } }
```

---

## UC

### GET `/api/uc/overview?year=2025&session=S2&threshold=0.9`

Budget dashboard per offering: `budget`, `spent`, `pctUsed`, `variance` and `alerts` ≥ threshold.

### GET `/api/uc/units`

Returns offering IDs where the current user (from `x-user-id`) has role `uc`.

### GET `/api/uc/dashboard`

Placeholder (not implemented).

---

## Claims

### POST `/api/claims`

Create a claim and compute `claimed_amount` from paycode rate **for the current financial year**.

**Body**

```json
{ "allocation_id": 1, "requester_id": 2, "paycode": "TU2", "claimed_hours": 1.5 }
```

**Response**

```json
{ "data": { "claim_id": 10, "claimed_amount": 123.45, "...": "..." } }
```

---

## Conventions

* **Auth & Context**: Many routes read `x-user-id` / `x-user-email` / `x-user-roles` headers (middleware-injected). Login sets an `auth-token` cookie (HTTP-only).
* **Dates/Times**: Stored in Postgres; responses use ISO dates and `HH:MM:SS` for times.
* **Pagination**: Most list routes accept `page` and `limit`.
* **Sorting & Search**: Admin & Tutor lists support `q`, `sort`, `dir` with whitelisted columns.
* **Status Enums**: Common values include `active`, `cancelled`, `swapped`, and request statuses like `pending_ta`, `pending_uc`.
* **Safety Checks**: ETL endpoints enforce validation before commit; discard vs rollback are distinct operations.

---

### Appendix A — Quick cURL (examples)

```bash
# Auth
curl -X POST $BASE/api/auth/login -H 'Content-Type: application/json' \
  -d '{"useremail":"u@ex","password":"123"}'

# Tutor allocations
curl "$BASE/api/tutor/allocations?userId=3&page=1&limit=10&q=INFO"

# Admin allocations
curl "$BASE/api/admin/allocations?page=1&limit=25&sort=date&dir=asc"

# ETL import
curl -X POST "$BASE/api/admin/import" -F "file=@mock.csv"

# Commit
curl -X POST "$BASE/api/admin/import/commit" -H 'Content-Type: application/json' \
  -d '{"stagingId":42}'

# Discard
curl -X POST "$BASE/api/admin/discard" -H 'Content-Type: application/json' \
  -d '{"batchId":42}'

# Rollback
curl -X POST "$BASE/api/admin/rollback" -H 'Content-Type: application/json' \
  -d '{"runId":9}'
```
