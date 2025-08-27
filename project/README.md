# SOFT3888_TU_08_01_P30 Monorepo

This repository contains the frontend for a Next.js project, along with documentation and Git hooks for quality control.

## Node JS

This project uses `npm` and `npx` which comes with the installation of Node JS `v22.18.0`
https://nodejs.org/en/download
Use the following commands to verify that the install was successful

```bash
npm --v
npx --v
```

## Repository Structure

```
/
├── .husky/               # Git hooks for commit and push checks
├── documentation/        # Project documentation and meeting minutes
├── project/              # Next.js frontend application
│   ├── app/              # Next.js app directory
│   ├── __tests__/        # Unit and integration tests
│   ├── coverage/         # Test coverage reports
│   ├── public/           # Static assets (if any)
│   ├── package.json      # Frontend dependencies and scripts
│   ├── tsconfig.json     # TypeScript configuration
│   ├── eslint.config.mjs # ESLint configuration
│   ├── jest.config.ts    # Jest configuration
│   └── ...               # Other config and source files
├── package.json          # Root dependencies (husky)
└── .gitignore            # Root gitignore
```

## Development Setup

### 1. Install Dependencies

From the root directory, install Husky:

```bash
npm install
```

Then, install frontend dependencies:

```bash
cd project
npm install
```

### 2. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 3. Linting

Run ESLint to check code quality:

```bash
npm run lint
```

### 4. Testing

Run all tests with:

```bash
npm run test
```

Test coverage reports are generated in the `coverage/` directory.

### 5. Git Hooks

- **Commit messages** are validated for format (see below).
- **Pre-push** runs all tests; pushes are blocked if tests fail.

## Commit Message Format

All commit messages must follow this format:

```
<type>(frontend|backend) : [IS-<number>] <optional description>
```

- **Types:** feat | fix | docs | test
- **Scope:** frontend | backend

**Examples:**

- `feat(frontend) : [IS-123] Add login page`
- `fix(backend) : [IS-456] Handle null user`

## Documentation

See the [documentation/](../documentation) folder for meeting minutes and other project docs.
