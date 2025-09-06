# Testing Index & Traceability

| Req | What it verifies | Test Plan | Evidence (link) |
|-----|------------------|-----------|-----------------|
| FR2 | Tutor sees only their allocations | TP01_api-functional.md (TC-A1) | screenshots/api-tutor-A1.png |
| FR9 | Review/approve/reject/escalate | TP01_api-functional.md (TC-A4) | run-logs/review-flow.txt |
| FR12–14 | Import/Preview/Commit/Discard/Rollback | TP02_etl-pipeline.md | screenshots/etl-commit.png |
| NFR2 | ≤3s on ≤1k rows | TP05_performance.md (TC-P1) | perf/allocations-1k.csv, perf/results.md |
| NFR6 | Tests/linters block | TP08_ci-quality-gates.md | screenshots/pre-push-block.png |

> Run order: TP02 (seed) → TP01 (API) → TP03/TP04 (access & schema) → TP05 (perf) → TP06 (negatives) → TP07 (UX) → TP08 (CI).
