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

## Authentication

The API uses two authentication schemes:

- **Bearer JWT** — For authenticated user endpoints. Pass an access token in the `Authorization` header:
  ```
  Authorization: Bearer <access_token>
  ```
- **API Key** — For webhook endpoints. Pass the API key in the `Authorization` header:
  ```
  Authorization: ApiKey <api_key>
  ```

### Error Responses

All error responses return JSON with an `error` field:

```json
{ "error": "Description of the error" }
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request (missing/invalid fields, chirp too long) |
| `401` | Not authenticated (missing/invalid token or credentials) |
| `403` | Forbidden (not the resource owner, or non-dev environment) |
| `404` | Resource not found |
| `500` | Internal server error |

---

## API Endpoints

### `GET /api/healthz`

Health check.

**Response:** `200` — `text/plain`
```
OK
```

---

### `POST /api/users`

Create a new user.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "s3cret"
}
```

**Response:** `201`
```json
{
  "id": "uuid",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "email": "user@example.com",
  "isChirpyRed": false
}
```

---

### `PUT /api/users`

Update the authenticated user's email and password.

**Auth:** `Bearer <access_token>`

**Request body:**
```json
{
  "email": "new@example.com",
  "password": "newpassword"
}
```

**Response:** `200` — same shape as create user response.

---

### `POST /api/login`

Log in with email and password. Returns a JWT access token and a refresh token.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "s3cret"
}
```

**Response:** `200`
```json
{
  "id": "uuid",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "email": "user@example.com",
  "isChirpyRed": false,
  "token": "<access_token>",
  "refreshToken": "<refresh_token>"
}
```

---

### `POST /api/refresh`

Get a new access token using a refresh token.

**Auth:** `Bearer <refresh_token>`

**Response:** `200`
```json
{
  "token": "<new_access_token>"
}
```

---

### `POST /api/revoke`

Revoke a refresh token.

**Auth:** `Bearer <refresh_token>`

**Response:** `204` — no body.

---

### `POST /api/chirps`

Create a chirp (max 140 characters). Certain words (`kerfuffle`, `sharbert`, `fornax`) are replaced with `****`.

**Auth:** `Bearer <access_token>`

**Request body:**
```json
{
  "body": "Hello, world!"
}
```

**Response:** `201`
```json
{
  "id": "uuid",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "body": "Hello, world!",
  "userId": "uuid"
}
```

---

### `GET /api/chirps`

List all chirps.

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `authorId` | `string` (uuid) | Filter chirps by author |
| `sort` | `"asc"` \| `"desc"` | Sort by creation time (default: `asc`) |

**Response:** `200` — array of chirp objects.

---

### `GET /api/chirps/:chirpId`

Get a single chirp by ID.

**Response:** `200` — chirp object, or `404` if not found.

---

### `DELETE /api/chirps/:chirpId`

Delete a chirp. Only the chirp's author can delete it.

**Auth:** `Bearer <access_token>`

**Response:** `204` — no body. Returns `403` if not the author, `404` if not found.

---

### `GET /admin/metrics`

View server request metrics (HTML page).

**Response:** `200` — `text/html`

---

### `POST /admin/reset`

Reset metrics counter and delete all users. Only available in `dev` environment.

**Response:** `200` — `text/plain`. Returns `403` in non-dev environments.

---

### `POST /api/polka/webhooks`

Webhook endpoint for upgrading a user to Chirpy Red. Only processes `user.upgraded` events; other events return `204` with no action.

**Auth:** `ApiKey <polka_api_key>`

**Request body:**
```json
{
  "event": "user.upgraded",
  "data": {
    "userId": "uuid"
  }
}
```

**Response:** `204` — no body. Returns `404` if user not found.

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
