# Backend API 

## Tutor Allocations (main)

`GET /api/tutor/allocations`

-   **Params:**
    -   `userId` (optional) → filter by tutor, omit = all tutors\
    -   `page` (default 1)\
    -   `limit` (default 10, max 100)
-   **Examples:**
    -   All tutors: `/api/tutor/allocations?page=1&limit=10`\
    -   Single tutor: `/api/tutor/allocations?userId=3&page=1&limit=10`
-   **Response:**\

``` json
{ "page": 1, "limit": 10, "data": [ { "id": 1, "user_id": 3, "unit_code": "...", "activity_type": "...", ... } ] }
```

------------------------------------------------------------------------

## Admin Overview

`GET /api/admin/overview` →
`{ users: [ { user_id, first_name, last_name, role } ] }`

------------------------------------------------------------------------

## Import / ETL

-   `POST /api/admin/import` → upload CSV → `{ stagingId }`\
-   `GET /api/admin/preview?stagingId=42` → preview batch\
-   `POST /api/admin/import/commit` → commit batch\
-   `POST /api/admin/discard` → discard batch\
-   `GET /api/admin/history?limit=20` → history (staged + runs)\
-   `POST /api/admin/rollback` → rollback a run

------------------------------------------------------------------------

## UC Budget

`GET /api/uc/overview?year=2025&session=S2&threshold=0.9`\
→ `{ year, session, threshold, rows, alerts }`

------------------------------------------------------------------------

## Notes

-   Pagination supported (`page`, `limit`).\
-   All SQL parameterized.\
-   Time values = ISO 8601.\
-   Auth TBD (FE hides what users shouldn't see).
