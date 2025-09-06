# TP04 – Data Integrity & Schema

**TC-S1 FK Enforcement**  
Insert `allocation` referencing non-existent `user_id` → FK violation.

**TC-S2 Uniqueness**  
Re-import same `session_occurrence` → prevented by ON CONFLICT or unique keys.

**TC-S3 Null/Domain**  
Try null in required fields (e.g., `paycode_id`) → rejected.

**Evidence:** SQL error outputs, table DDL excerpts.
