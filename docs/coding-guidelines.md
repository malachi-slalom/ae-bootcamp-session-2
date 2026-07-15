# Coding Guidelines

This document describes the coding style and quality principles for this project. All contributors should follow these guidelines to keep the codebase consistent and maintainable.

## General Formatting

- Use 2-space indentation throughout the codebase (both frontend and backend).
- Keep lines to a readable length; avoid excessively long lines.
- Place a single blank line between logical sections of a function and between top-level declarations.
- End every file with a newline character.
- Use single quotes for strings in JavaScript unless the string itself contains a single quote, in which case use double quotes or a template literal.

## Language and Module Style

The frontend and backend use different module systems to match their respective toolchains:

- **Frontend** (React/Create React App): Use ES Module syntax — `import`/`export`.
- **Backend** (Node.js/Express): Use CommonJS syntax — `require()`/`module.exports`.

Do not mix the two styles within a package.

## Import Organization

Organize imports at the top of each file in the following order, with a blank line separating each group:

1. **Built-in Node.js modules** (e.g., `path`, `fs`) — backend only.
2. **Third-party packages** (e.g., `express`, `react`, `axios`).
3. **Local modules and components** (relative paths, e.g., `./App`, `../utils`).
4. **Style sheets** — frontend only (e.g., `import './App.css'`).

Never place imports in the middle of a file or after executable code.

## Naming Conventions

- Use **camelCase** for variables, function names, and instance properties.
- Use **PascalCase** for React component names and class names.
- Use **UPPER_SNAKE_CASE** for true constants (values that never change at runtime, e.g., `DEFAULT_PORT`).
- Name files to match the primary export they contain (e.g., `App.js` exports the `App` component).
- Test files must match the name of the module they test (e.g., `app.test.js` tests `app.js`).

## DRY Principle

Avoid duplicating logic. If the same behavior appears in more than one place, extract it into a shared function, hook, or utility module. Common patterns include:

- Shared validation logic placed in a helper rather than repeated in each route handler or component.
- Reusable React components instead of copy-pasted JSX blocks.
- Shared constants (e.g., API base paths, status codes) defined once and imported where needed.

## Error Handling

- Every async operation must be wrapped in a `try/catch` block.
- Backend route handlers must return a meaningful HTTP status code alongside any error response JSON.
- Frontend code must set an error state and display a user-friendly message rather than silently swallowing errors.
- Use `console.error` (not `console.log`) when logging caught errors so they stand out in output.

## Input Validation

- Validate all data at system boundaries — API request bodies on the backend, and user-submitted form values on the frontend — before acting on it.
- Return a `400 Bad Request` response with a clear error message when required fields are missing or invalid.
- Prevent creating or persisting data that fails validation; do not let invalid state reach the database.

## Linting

The frontend is configured with ESLint via Create React App's built-in `react-app` and `react-app/jest` rule sets (see `eslintConfig` in `packages/frontend/package.json`). The backend inherits Node.js-compatible defaults through Jest's `detectOpenHandles` and the project's module conventions.

Guidelines for working with the linter:

- Do not disable lint rules with inline comments (`// eslint-disable`) unless there is a documented, unavoidable reason.
- Resolve all lint warnings before merging code; treat warnings as errors in practice.
- Run the frontend linter as part of the build (`react-scripts build`) to catch issues early.

## Environment Configuration

- Use environment variables with sensible defaults for all environment-specific values.
- Never hard-code ports, URLs, or secrets directly in source code.
- Follow the project's established pattern for port configuration:

  ```js
  const PORT = process.env.PORT || 3030;
  ```

- Store secrets and credentials exclusively in environment variables; never commit them to version control.

## Code Quality Principles

- **Single Responsibility**: Each function, component, or module should do one thing well. If a function needs a long comment to explain what it does, consider breaking it up.
- **Readability over cleverness**: Prefer clear, straightforward code over terse or overly clever solutions. The next reader of the code may not share your context.
- **Small functions**: Keep functions short enough that their entire body is visible without scrolling. Extract sub-tasks into well-named helper functions.
- **Consistent patterns**: Stick to the patterns already established in the codebase (e.g., how routes are structured in the backend, how state is managed in the frontend) rather than introducing new patterns without a clear reason.
