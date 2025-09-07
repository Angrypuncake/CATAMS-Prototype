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
