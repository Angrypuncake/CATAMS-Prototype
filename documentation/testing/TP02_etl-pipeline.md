# TP02 – ETL Pipeline

## Test Cases
**TC-E1 Upload + Preview**  
POST `/api/admin/import` (CSV multipart) → get `{stagingId}`  
GET `/api/admin/preview?stagingId=…` → staged rows visible; malformed row flagged.

**TC-E2 Commit**  
POST `/api/admin/import/commit` `{stagingId}` → upserts into `unit_offering`, `teaching_activity`, `session_occurrence`, `allocation`.  
Expect: counts match; no duplicates (conflict handling).

**TC-E3 Discard**  
POST `/api/admin/discard` (second upload) → staging cleared; no prod writes.

**TC-E4 History + Rollback**  
GET `/api/admin/history?limit=20` → pick `runId`  
POST `/api/admin/rollback` `{runId}` → prod rows tied to run reverted.

## Evidence
- Before/after row counts per table
- History/rollback logs
- Screenshots of preview & commit responses
