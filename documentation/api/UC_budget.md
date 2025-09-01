# UC/Admin Budget Contracts (MVP)

## TL;DR
- **UI Route**
  - `/uc-test`: Developer page for UC/Admin budget dashboard (threshold slider + alerts + budget table)

- **API Route**
  - `GET /api/uc/overview`: Returns budget overview for unit offerings

---

## UI Routes

| Path        | Params | Purpose                                    |
|-------------|--------|--------------------------------------------|
| `/uc-test`  | –      | Test page to visualize UC budget dashboard |

**Features**:
- Threshold slider (default 90%)  
- Budget overview table (Budget, Spent, % Used, Variance, Status)  
- Alerts row (units over threshold)

---

## API Routes

### `GET /api/uc/overview`
- **Purpose**: Provide aggregated budget data for UC/Admin dashboard
- **Query Params**:
  - `year` (required, e.g. `2025`)
  - `session` (required, e.g. `S2`)
  - `threshold` (optional, default = 0.9)
- **Response**:
  ```json
  {
    "year": 2025,
    "session": "S2",
    "threshold": 0.9,
    "rows": [
      {
        "offeringId": 1,
        "unitCode": "COMP2022",
        "unitName": "Models of Computation",
        "budget": 120000,
        "spent": 109000,
        "pctUsed": 0.908,
        "variance": -9000
      },
      {
        "offeringId": 2,
        "unitCode": "COMP3419",
        "unitName": "AI & Deep Learning",
        "budget": 80000,
        "spent": 45500,
        "pctUsed": 0.569,
        "variance": 34500
      }
    ],
    "alerts": [
      {
        "type": "budget",
        "offeringId": 1,
        "unitCode": "COMP2022",
        "pctUsed": 0.908,
        "message": "COMP2022 is at 91% budget used."
      }
    ]
  }
  ```

- **Database Dependencies**:
  - `course_unit` → unit code/name
  - `unit_offering` → year, session, budget
  - `budget_transaction` → transactions aggregated into `spent`

---

## User Flow

1. UC opens `/uc-test`  
2. Page fetches `GET /api/uc/overview?year=2025&session=S2&threshold=0.9`  
3. Backend aggregates budget vs transactions → returns JSON  
4. UI renders:  
   - Budget overview table  
   - Status pill (`Open` vs `Healthy`) based on threshold  
   - Alerts chips for over-budget units  
