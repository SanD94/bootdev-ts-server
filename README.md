# Chirpy — bootdev-ts-server

A Twitter-like REST API built with Express 5 and TypeScript as part of the [Boot.dev](https://www.boot.dev/) backend curriculum.

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express 5
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/)
- **Auth:** JWT (jsonwebtoken) + Argon2 password hashing
- **Package Manager:** Yarn 4 (PnP)
- **Testing:** Vitest

## API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/healthz` | Health check |
| `POST` | `/api/users` | Create a user |
| `POST` | `/api/login` | Login (returns JWT + refresh token) |
| `POST` | `/api/refresh` | Refresh an access token |
| `POST` | `/api/revoke` | Revoke a refresh token |
| `GET` | `/api/chirps` | List chirps (optional `authorId`, `sort` query params) |
| `GET` | `/api/chirps/:chirpId` | Get a single chirp |

### Authenticated

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/chirps` | Create a chirp (max 140 chars) |
| `DELETE` | `/api/chirps/:chirpId` | Delete own chirp |
| `PUT` | `/api/users` | Update own user |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/metrics` | View server metrics |
| `POST` | `/admin/reset` | Reset metrics |

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/polka/webhooks` | Upgrade user to Chirpy Red |

## Getting Started

### Prerequisites

- Node.js ≥ 22
- PostgreSQL
- Yarn 4

### Environment Variables

Create a `.env` file in the project root:

```
PORT=8080
PLATFORM=dev
DB_URL=postgres://user:password@localhost:5432/chirpy
JWT_SECRET=your-secret-key
POLKA_KEY=your-polka-api-key
```

### Install & Run

```bash
yarn install
yarn migrate      # run database migrations
yarn dev           # build and start the server
```

### Other Commands

```bash
yarn build         # compile TypeScript
yarn start         # run compiled output
yarn test          # run tests
yarn generate      # generate new Drizzle migrations
```

## Project Structure

```
src/
├── index.ts              # Entrypoint, route registration, runs migrations
├── config.ts             # Env-based configuration
├── auth.ts               # JWT & password hashing utilities
├── api/
│   ├── chirps.ts         # Chirp route handlers
│   ├── users.ts          # User route handlers
│   ├── auth.ts           # Login / refresh / revoke handlers
│   ├── polka.ts          # Webhook handler (Chirpy Red upgrade)
│   ├── readiness.ts      # Health check handler
│   ├── metrics.ts        # Metrics handlers
│   ├── middleware.ts      # Logging, metrics, error middleware
│   └── errors.ts         # Typed error classes
├── db/
│   ├── schema.ts         # Drizzle table definitions
│   ├── queries/          # DB query functions per entity
│   └── migrations/       # Generated Drizzle migrations
└── app/                  # Static file assets
```
