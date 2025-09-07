# TP06 – Security & Negative Tests

- Missing/invalid tokens → 401.
- Over-broad filters (e.g., omit `userId`) must not leak others’ data.
- Path traversal / unexpected params ignored or validated.

**Evidence:** Responses, logs with redactions.
