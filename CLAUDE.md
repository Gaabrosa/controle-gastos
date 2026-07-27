# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"controle-gastos" (expense tracker) is an early-stage Node.js/Express backend with a PostgreSQL database, accessed via the `pg` driver. The codebase currently consists only of a database connection module and a connectivity check script — no HTTP routes, models, or Express server are wired up yet.

## Commands

- Install dependencies: `npm install`
- Run the DB connectivity check: `node src/app.js`
- There is no test suite configured yet (`npm test` is a placeholder that exits with an error).
- There is no lint/build step configured.

## Architecture

- `src/db.js` — creates and exports a single shared `pg` `Pool` instance (module-level singleton). Any code that needs DB access should `require("./db")` and use this pool rather than creating new `Pool`/`Client` instances.
- `src/app.js` — currently just a standalone script that queries `SELECT NOW()` against the pool to verify the DB connection works, and logs the result. This is a smoke test, not the application entry point for an HTTP server.
- `package.json` `main` points to `index.js`, which does not exist yet — don't assume it's the entry point.

## Database

- Target database: PostgreSQL, expected locally at `localhost:5432`, database name `controle_gastos`.
- Connection credentials in `src/db.js` are currently hardcoded (including a plaintext password) rather than loaded from environment variables. If adding configuration/env-based credentials, replace this file's hardcoded values and remove the real password from history — do not just leave it alongside a `.env` fallback.
