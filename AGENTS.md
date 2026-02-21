# AGENTS.md

## Build & Test
- **Build:** `yarn build` (tsc)
- **Dev:** `yarn dev` (build + run)
- **Test all:** `yarn test` (vitest --run)
- **Test single:** `yarn test src/auth.test.ts` or `yarn vitest --run -t "test name"`
- **DB migrate:** `yarn migrate` / **Generate:** `yarn generate`

## Architecture
Express 5 REST API (ESM, `"type": "module"`) with PostgreSQL via Drizzle ORM. Yarn 4 (PnP).
- `src/index.ts` — entrypoint, route registration, runs migrations on startup
- `src/api/` — route handlers (`handler*` functions), middleware, error classes
- `src/db/schema.ts` — Drizzle table definitions (users, chirps, refreshTokens)
- `src/db/queries/` — DB query functions per entity
- `src/auth.ts` — JWT (jsonwebtoken), argon2 password hashing, token extraction
- `src/config.ts` — env-based config via `process.loadEnvFile()`

## Code Style
- TypeScript strict mode, ESNext target. Imports use `.js` extensions (ESM).
- Handlers are `async (req: Request, res: Response)` exported as named functions (`handlerX`).
- Errors: throw typed error classes from `src/api/errors.ts` (BadRequestError, NotFoundError, etc.); caught by `middlewareError`.
- Types: use Drizzle `$inferInsert`/`$inferSelect`; prefer `type` over `interface`; use `Pick<>` for request body shapes.
- Tests: vitest with `describe`/`it`/`expect`, co-located as `*.test.ts`.
- Formatting: 2-space indent, double quotes, trailing commas optional.
