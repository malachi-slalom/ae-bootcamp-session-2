# Testing Guidelines

This document defines the testing principles and standards for this project.

## Core Principles

- All new features must include appropriate tests.
- Tests must be maintainable and follow best practices.
- All tests must be isolated and independent.
- Setup and teardown hooks are required so tests succeed on multiple runs.

## Unit Tests

- Framework: Use Jest to test individual functions and React components in isolation.
- Naming: Unit tests must use `*.test.js` or `*.test.ts`.
- Backend location: `packages/backend/__tests__/`.
- Frontend location: `packages/frontend/src/__tests__/`.
- File naming: Name unit test files to match what they are testing (for example, `app.test.js` for `app.js`).

## Integration Tests

- Framework: Use Jest + Supertest to test backend API endpoints with real HTTP requests.
- Location: `packages/backend/__tests__/integration/`.
- Naming: Integration tests must use `*.test.js` or `*.test.ts`.
- File naming: Name integration test files based on what they test (for example, `todos-api.test.js` for TODO API endpoints).

## End-to-End (E2E) Tests

- Framework: Use Playwright (required) to test complete UI workflows through browser automation.
- Location: `tests/e2e/`.
- Naming: E2E tests must use `*.spec.js` or `*.spec.ts`.
- File naming: Name E2E files based on the user journey they test (for example, `todo-workflow.spec.js`).
- Browser scope: Playwright tests must use one browser only.
- Test design: Playwright tests must use the Page Object Model (POM) pattern for maintainability.
- Coverage scope: Limit E2E tests to 5-8 critical user journeys, focused on happy paths and key edge cases.

## Port Configuration

- Always use environment variables with sensible defaults for port configuration.
- Backend port configuration must follow:

```js
const PORT = process.env.PORT || 3030;
```

- Frontend uses React's default port `3000`, but it can be overridden with the `PORT` environment variable.
- This enables CI/CD workflows to dynamically detect and assign ports.

## Reliability Requirements

- Every test must create and manage its own data.
- No test should depend on another test's execution order or side effects.
- Use setup and teardown hooks consistently for deterministic test runs.
