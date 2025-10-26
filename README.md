# P30 – Casual Academic Time Allocation Management System (CATAMS)

**Group Tag:** SOFT3888_TU08_01  
**Tutor:** Penghui Wen  
**Client:** Dr. Armin Chitizadeh  

---

## 📌 Project Overview
CATAMS is a standalone web platform designed to replace the current email-based workflow for managing casual academic teaching allocations. It provides **role-based dashboards** for Tutors, Teaching Assistants (TAs), Unit Coordinators (UCs), and Admins to streamline allocations, approvals, budgeting, and communication.

Our goal is to deliver a **secure, scalable, and user-friendly system** that improves transparency, reduces administrative overhead, and lays a foundation for future university-wide integration.

---

## 🚀 Key Features
- **Tutor Dashboard** – view allocations, submit claims, swaps, corrections, cancellations, and queries.  
- **TA/UC Dashboard** – review tutor requests, approve/reject/escalate, manage budgets and thresholds.  
- **Admin ETL Tools** – CSV import, staging, validation, preview, and rollback for allocation data.  
- **Role-Based Access** – each role has tailored permissions and views.  
- **Budget Oversight** – coordinators can track allocations against budgets with alerts.  
- **Data Export** – allocations and approvals exportable in CSV/JSON format.  
- **Quality Gates** – CI/CD enforced with Jest tests, Husky hooks, and linting.  

---

## 🛠️ Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, MUI, TailwindCSS  
- **Backend:** Next.js API routes, Supabase (PostgreSQL + Auth), pg  
- **Tooling & QA:** Jest, React Testing Library, ESLint, Prettier, Husky, GitHub Actions  
- **Collaboration:** GitHub Projects (issues & boards), Slack, Google Drive, Miro  

---

## 📂 Documentation
- [HTML Prototypes](documentation/html_prototypes)  
- [API Contract](documentation/api/contract.md)  
- [cURL Suite](documentation/api/curl_suite.md)  
- [Database Schema & ETL Scripts](documentation/schema)  
- [Testing Docs](documentation/testing)  
- [Status Report](documentation/status_report.md)  

---

## 👥 Team Members
- Elvis Nguyen (Backend)  
- Paul Zhang (FullStack)  
- Alex Vaughan (Backend)  
- Cameron Vella (Frontend)  
- Justin Hoogwaerts (Frontend)  
- Suryansh S. Shekhawat (Frontend)  
- Gemma Lee (Frontend)

---

## ▶️ Setting up the System

### Node JS
This project uses **npm** and **npx** which come with the installation of **Node JS v22.18.0**  
👉 [Download Node.js](https://nodejs.org/en/download)  

Verify installation with:
```bash
npm --v
npx --v
```

## Development Setup

Install Dependencies
From the root directory, install Husky:

```
npm install
```

Then install frontend dependencies:
```
cd project
npm install
```

Configure Environment Variables (Supabase requirement)
```
Request environment variables from DB OWNER Elvis Nguyen
Copy and paste variables into .env.local under /project
```

## Running the Development Server
```
npm run dev
```


## Run tests

```
npm run test
```
Open http://localhost:3000
 to view the app.

## Testing report
# Unit tests `npm run test`
File                                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------------------------|---------|----------|---------|---------|-------------------
All files                               |   99.58 |    92.46 |   91.11 |   99.58 |                   
 app/admin/allocations                  |   99.27 |    93.75 |     100 |   99.27 |                   
  util.tsx                              |   99.27 |    93.75 |     100 |   99.27 | 134               
 app/admin/allocations/components       |   99.31 |    89.75 |   78.94 |   99.31 |                   
  AllocationDrawer.tsx                  |   98.35 |    82.27 |   70.58 |   98.35 | ...42,289,393,397 
  AllocationsTable.tsx                  |     100 |    90.47 |      60 |     100 | 143,159           
  FilterControls.tsx                    |     100 |    85.71 |     100 |     100 | 80                
  PaycodeCombo.tsx                      |     100 |      100 |     100 |     100 |                   
  PropagationPanel.tsx                  |   98.65 |    94.73 |   70.58 |   98.65 | 32-35             
  TimelineView.tsx                      |     100 |     92.3 |     100 |     100 | 131-139,219,349   
  TutorCombo.tsx                        |     100 |       92 |     100 |     100 | 29,43             
 app/admin/allocations/hooks            |     100 |    83.33 |     100 |     100 |                   
  useOutsideClick.tsx                   |     100 |    83.33 |     100 |     100 | 11                
 app/dashboard/admin                    |     100 |      100 |     100 |     100 |                   
  AdminBudgetBox.tsx                    |     100 |      100 |     100 |     100 |                   
  AdminInfoBox.tsx                      |     100 |      100 |     100 |     100 |                   
 app/dashboard/assistant                |     100 |      100 |      80 |     100 |                   
  AllocationsTable.tsx                  |     100 |      100 |     100 |     100 |                   
  ClaimsTable.tsx                       |     100 |      100 |     100 |     100 |                   
  RequestsTable.tsx                     |     100 |      100 |     100 |     100 |                   
  SelectField.tsx                       |     100 |      100 |      50 |     100 |                   
 app/dashboard/coordinator              |   99.21 |      100 |   66.66 |   99.21 |                   
  CoordinatorApprovalTable.tsx          |     100 |      100 |     100 |     100 |                   
  UnitBudgetOverviewTable.tsx           |   98.34 |      100 |      50 |   98.34 | 70-71             
 app/dashboard/coordinator/_components  |      99 |      100 |      80 |      99 |                   
  AssignUnscheduledButton.tsx           |    91.3 |      100 |      50 |    91.3 | 10-11             
  UnscheduledAllocationsTable.tsx       |     100 |      100 |     100 |     100 |                   
 app/dashboard/review/[id]/_components  |   99.81 |    85.61 |    93.1 |   99.81 |                   
  CancelReview.tsx                      |     100 |    94.11 |     100 |     100 | 73,185            
  ClaimReview.tsx                       |     100 |      100 |      50 |     100 |                   
  CorrectionReview.tsx                  |   99.74 |    87.09 |     100 |   99.74 | 327               
  QueryReview.tsx                       |     100 |     90.9 |     100 |     100 | 34                
  ReviewFallback.tsx                    |     100 |      100 |     100 |     100 |                   
  ReviewLayout.tsx                      |     100 |      100 |     100 |     100 |                   
  SwapReview.tsx                        |   99.57 |    71.42 |     100 |   99.57 | 141,143           
 app/dashboard/tutor                    |     100 |    94.52 |    90.9 |     100 |                   
  AllocationQuickviewModal.tsx          |     100 |      100 |      75 |     100 |                   
  components.tsx                        |     100 |       50 |     100 |     100 | 14                
  utils.ts                              |     100 |     92.3 |     100 |     100 | 34                
 .../tutor/allocations/[id]/_components |   96.62 |       50 |     100 |   96.62 |                   
  AllocationDetails.tsx                 |   96.62 |       50 |     100 |   96.62 | 27-29             
 ...board/tutor/allocations/_components |     100 |      100 |     100 |     100 |                   
  CommentBubble.tsx                     |     100 |      100 |     100 |     100 |                   
  DetailRow.tsx                         |     100 |      100 |     100 |     100 |                   
  NewCommentBox.tsx                     |     100 |      100 |     100 |     100 |                   
  RequestRow.tsx                        |     100 |      100 |     100 |     100 |                   
 app/services                           |   99.36 |    88.97 |   98.18 |   99.36 |                   
  activityService.ts                    |     100 |      100 |     100 |     100 |                   
  allocationService.ts                  |     100 |    80.88 |     100 |     100 | ...00,210,241-247 
  authService.ts                        |     100 |      100 |     100 |     100 |                   
  budgetService.ts                      |     100 |    95.23 |     100 |     100 | 70                
  claimService.ts                       |     100 |      100 |     100 |     100 |                   
  notificationService.ts                |     100 |      100 |     100 |     100 |                   
  paycodeService.ts                     |     100 |      100 |     100 |     100 |                   
  requestService.ts                     |   97.44 |    94.73 |   85.71 |   97.44 | 11-13,81-84       
  unitService.ts                        |     100 |      100 |     100 |     100 |                   
  userService.ts                        |     100 |      100 |     100 |     100 |                   
 app/utils                              |     100 |      100 |     100 |     100 |                   
  dateHelpers.ts                        |     100 |      100 |     100 |     100 |                   
  statusMapper.ts                       |     100 |      100 |     100 |     100 |                   
 components                             |     100 |    96.55 |     100 |     100 |                   
  AlertBox.tsx                          |     100 |      100 |     100 |     100 |                   
  HomePortalButton.tsx                  |     100 |      100 |     100 |     100 |                   
  MinimalNav.tsx                        |     100 |    93.33 |     100 |     100 | 51                
  UsydLogo.tsx                          |     100 |      100 |     100 |     100 |                   
 components/DynamicTable                |     100 |    99.47 |     100 |     100 |                   
  DynamicTable.tsx                      |     100 |    98.73 |     100 |     100 | 176               
  renderUtils.tsx                       |     100 |      100 |     100 |     100 |                   
  utils.ts                              |     100 |      100 |     100 |     100 |                   
 components/DynamicTable/components     |     100 |    96.29 |      90 |     100 |                   
  ActionButtons.tsx                     |     100 |      100 |     100 |     100 |                   
  DefaultArrayRenderer.tsx              |     100 |      100 |     100 |     100 |                   
  InspectButton.tsx                     |     100 |      100 |      75 |     100 |                   
  SearchBar.tsx                         |     100 |      100 |     100 |     100 |                   
  TableHeader.tsx                       |     100 |    88.88 |     100 |     100 | 34                
 lib                                    |     100 |    92.85 |     100 |     100 |                   
  axios.ts                              |     100 |    92.85 |     100 |     100 | 33                
----------------------------------------|---------|----------|---------|---------|-------------------
Test Suites: 53 passed, 53 total
Tests:       595 passed, 595 total
Snapshots:   0 total
Time:        12.663 s
Ran all test suites.

# Integration tests `npm run test:integration`
 PASS   integration  __tests__/integration/api/allocations.integration.test.ts (7.908 s) 
 
 PASS   integration  __tests__/integration/api/budget-requests.integration.test.ts (5.71 s)
 
 PASS   integration  __tests__/integration/api/users.integration.test.ts
 
 PASS   integration  __tests__/integration/api/database.integration.test.ts

Test Suites: 4 passed, 4 total

Tests:       43 passed, 43 total

Snapshots:   0 total

Time:        21.325 s

Ran all test suites.

# End to End tests `npm run test:e2e:ui`
20/20 passed, verify e2e UI screenshot in https://github.sydney.edu.au/engu9651/SOFT3888_TU_08_01_P30/pull/175.
