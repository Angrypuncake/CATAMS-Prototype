# contracts.md

## TL;DR
- **UI Routes**  
  - `/admin/import`: Upload CSV → staging  
  - `/admin/import/[stagingId]`: Preview batch → commit/discard  
  - `/admin/import/history`: View staged batches + runs → rollback  
- **API Routes**  
  - `POST /api/admin/import`: Upload CSV → create batch  
  - `POST /api/admin/import/commit`: Commit batch → insert data  
  - `POST /api/admin/discard`: Discard staging batch  
  - `GET /api/admin/history`: List staged batches + runs  
  - `POST /api/admin/rollback`: Roll back a run  
  - `GET /api/admin/preview`: Fetch preview of staging data  
  - `GET /api/tutor/allocations`: Paginated tutor allocations


---

## Overview
This document defines the **frontend routes** and **backend API contracts** for the Import/ETL workflow and related admin features.  

The contracts specify:
- Route purpose and parameters  
- Request/response payloads (where available)  
- Side effects and database operations  
- Example usage (curl)

---

## UI Routes

| Path                        | Params             | Purpose                                                    | Key actions/links                                   |
|-----------------------------|--------------------|------------------------------------------------------------|----------------------------------------------------|
| `/admin/import`             | –                  | Upload CSV to start a new staging batch                    | On upload, redirects to `/admin/import/[stagingId]` |
| `/admin/import/[stagingId]` | `stagingId: number`| Preview a staging batch; validate, filter, commit/discard   | Buttons: **Import New**, **Reload**, **Discard**, **Commit** |
| `/admin/import/history`     | –                  | View currently staged batches and recent commit runs        | Actions: **Rollback**, navigate to staged batches   |
| `/`                         | –                  | Redirects to `/portal`                                     | N/A                                                |
| `/database_test`            | –                  | Developer utility page for Supabase connectivity           | N/A                                                |

---

## API Routes

### `/api/admin/import`
- **Method**: `POST`  
- **Purpose**: Upload a CSV file to create a staging batch.  
- **Request**: `multipart/form-data` with file under key `file`  
- **Response**:
  ```json
  { "stagingId": 42 }
  ```
- **Side effects**:  
  - Inserts rows into `allocations_staging`  
  - Creates new `import_batch` record with `status = 'staged'`  

**Example**
```bash
curl -X POST http://localhost:3000/api/admin/import \
  -F "file=@mock_allocations_v1.csv"
```

---

### `/api/admin/import/commit`
- **Method**: `POST`  
- **Purpose**: Commit a staging batch to normalized tables.  
- **Request**:
  ```json
  { "stagingId": 42 }
  ```
- **Response**:
  ```json
  {
    "inserted": { "teaching_activity": 2, "session_occurrence": 26, "allocation": 26 }
  }
  ```
- **Side effects**:  
  - Runs ETL: moves data from staging → `teaching_activity`, `session_occurrence`, `allocation`  
  - Creates new `import_run` record tied to batch  
  - Marks `import_batch.status = 'committed'`

**Example**
```bash
curl -X POST http://localhost:3000/api/admin/import/commit \
  -H "Content-Type: application/json" \
  -d '{"stagingId": 42}'
```

---

### `/api/admin/discard`
- **Method**: `POST`  
- **Purpose**: Discard a staging batch without committing.  
- **Request**:
  ```json
  { "stagingId": 42 }
  ```
- **Response**:
  ```json
  { "discarded": true, "stagingId": 42 }
  ```
- **Side effects**:  
  - Deletes rows from `allocations_staging` for this batch  
  - Marks `import_batch.status = 'discarded'`

**Example**
```bash
curl -X POST http://localhost:3000/api/admin/discard \
  -H "Content-Type: application/json" \
  -d '{"stagingId": 42}'
```

---

### `/api/admin/history`
- **Method**: `GET`  
- **Purpose**: Retrieve staged batches and recent import runs.  
- **Query Params**:
  - `limit` (optional, default=50, max=200)
- **Response**:
  ```json
  {
    "staged": [
      { "batchId": 21, "created": "2025-08-31T11:56:12Z", "rows": 120, "blocking": false }
    ],
    "runs": [
      { "runId": 9, "batchId": 21, "status": "committed", "counts": { "TA":0,"SO":0,"AL":0 } }
    ]
  }
  ```

**Example**
```bash
curl http://localhost:3000/api/admin/history?limit=20
```

---

### `/api/admin/rollback`
- **Method**: `POST`  
- **Purpose**: Roll back a committed run (delete inserted rows).  
- **Request**:
  ```json
  { "runId": 9 }
  ```
- **Response**:
  ```json
  { "rolledBack": true, "runId": 9, "deleted": { "teaching_activity": 2, "session_occurrence": 26, "allocation": 26 } }
  ```
- **Side effects**:  
  - Calls `etl_rollback_run(runId)`  
  - Deletes rows inserted by that run  
  - Keeps `import_run` record for audit (status → `rolled_back`)

**Example**
```bash
curl -X POST http://localhost:3000/api/admin/rollback \
  -H "Content-Type: application/json" \
  -d '{"runId": 9}'
```

---

### `/api/admin/preview`
- **Method**: `GET`  
- **Purpose**: Fetch preview of staging data.  
- **Query**:
  - `stagingId` (required)  
- **Response**:
  ```json
  {
    "preview": {
      "raw": [ /* first N rows */ ],
      "issues": { "missing_unit_code": 0, "missing_activity_name": 1 },
      "timetable": [ /* parsed rows */ ]
    }
  }
  ```
- **Side effects**: None (read-only)

**Example**
```bash
curl http://localhost:3000/api/admin/preview?stagingId=42
```

---

### Other API routes (non-import features)

- `/api/tutor/allocations` (GET): Paginated list of tutor allocations.  
  - Query: `page`, `limit`  
  - Response: `{ page, limit, data: [...] }`

- `/api/auth/login` (POST): Test login route.  
  - Request: `{ username, password }`  
  - Response: `{ reply: "Hello from backend!" }`

- `/api/user/[id]`: Placeholder route; implementation unknown.

---

## User Flow (End-to-End)

1. **Import CSV**  
   - UI: `/admin/import` → select CSV → redirect to `/admin/import/[stagingId]`  
   - API: `POST /api/admin/import`  

2. **Preview**  
   - UI: `/admin/import/[stagingId]`  
   - API: `GET /api/admin/preview?stagingId=…`  

3. **Commit or Discard**  
   - Commit: `POST /api/admin/import/commit`  
   - Discard: `POST /api/admin/discard`  

4. **View History**  
   - UI: `/admin/import/history`  
   - API: `GET /api/admin/history`  

5. **Rollback (if needed)**  
   - UI: `/admin/import/history` (Rollback button)  
   - API: `POST /api/admin/rollback`
