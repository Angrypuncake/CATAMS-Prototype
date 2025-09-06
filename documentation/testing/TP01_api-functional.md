# TP01 – API Functional

## Data
Seed: 3 tutors, 2 units, 6 activities across S1/S2; 1 malformed row (for ETL preview validation).

## Test Cases
**TC-A1 Tutor allocations (happy)**  
GET `/api/tutor/allocations?userId=3&page=1&limit=10`  
Expect: 200; only `userId=3`; correct `page/limit`; stable pagination on page 2.

**TC-A2 Tutor allocations (empty)**  
GET `/api/tutor/allocations?userId=999`  
Expect: 200; `data=[]`; no error leakage.

**TC-A3 Admin overview**  
GET `/api/admin/overview`  
Expect: 200; users + role summaries present.

**TC-A4 UC budget**  
GET `/api/uc/overview?year=2025&session=S2&threshold=0.9`  
Expect: 200; `{year,session,threshold,rows,alerts}`; alerts trigger when threshold exceeded.

## Evidence to capture
- JSON responses (truncate IDs), screenshots of Postman/cURL, commit SHAs of handlers.
