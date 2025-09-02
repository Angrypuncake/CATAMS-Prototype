# === Import / ETL ===

# 1. Upload CSV to staging
curl -X POST http://localhost:3000/api/admin/import \
  -F "file=@mock_allocations_v1.csv"

# 2. Preview staging
curl "http://localhost:3000/api/admin/preview?stagingId=42"

# 3. Commit staging -> production
curl -X POST http://localhost:3000/api/admin/import/commit \
  -H "Content-Type: application/json" \
  -d '{"stagingId":42}'

# 4. Discard staging (no commit)
curl -X POST http://localhost:3000/api/admin/discard \
  -H "Content-Type: application/json" \
  -d '{"stagingId":42}'

# 5. History (staged + runs)
curl "http://localhost:3000/api/admin/history?limit=20"

# 6. Rollback committed run
curl -X POST http://localhost:3000/api/admin/rollback \
  -H "Content-Type: application/json" \
  -d '{"runId":9}'


# === Tutor Allocations ===

# A) All tutors (no filter)
curl "http://localhost:3000/api/tutor/allocations?page=1&limit=10"

# B) Single tutor (userId=3)
curl "http://localhost:3000/api/tutor/allocations?userId=3&page=1&limit=10"

# C) Larger page (page 2, 50 per page)
curl "http://localhost:3000/api/tutor/allocations?userId=3&page=2&limit=50"


# === Admin Overview ===

# Users/roles snapshot
curl "http://localhost:3000/api/admin/overview"


# === UC Budget ===

# Budget overview with threshold
curl "http://localhost:3000/api/uc/overview?year=2025&session=S2&threshold=0.9"
