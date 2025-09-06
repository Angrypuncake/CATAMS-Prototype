# TP05 – Performance

**TC-P1 Pagination Latency (baseline)**  
Dataset: ~1k allocations.  
GET `/api/tutor/allocations?userId=3&limit=100` → record p50/p95; target ≤3s.  
**Evidence:** timings (curl `-w`, Postman monitor), note DB indexes used.
