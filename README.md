# fm_backend

Node.js / TypeScript Express API for a fitness and mindfulness app. It handles auth (email OTP + JWT), user profiles, exercises, journals, habits, and messaging content, backed by PostgreSQL.

## Stack

- **Runtime:** Node.js, TypeScript, Express 5
- **Database:** PostgreSQL (`pg`)
- **Auth:** bcrypt passwords, email OTP via Resend, JWT access + refresh tokens
- **Dev:** `tsx` watch mode

## Prerequisites

- Node.js 18+
- PostgreSQL database

## Setup

```bash
npm install
cp .env.example .env
```

Configure `.env`:

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default `5050`) |
| `DATABASE_URL` | Yes | Postgres connection string |
| `JWT_SECRET` | Yes* | Shared JWT secret (fallback for access/refresh) |
| `JWT_ACCESS_SECRET` | No* | Access-token secret (falls back to `JWT_SECRET`) |
| `JWT_REFRESH_SECRET` | No* | Refresh-token secret (falls back to `JWT_SECRET`) |
| `RESEND_API_KEY` | Yes (for OTP email) | Resend API key |
| `RESEND_FROM_EMAIL` | Yes (for OTP email) | Sender address (e.g. `onboarding@resend.dev`) |
| `NODE_ENV` | No | Set to `production` to skip seeding on startup |

\* At least one of `JWT_SECRET`, or both `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`, must be set.

Example:

```
PORT=5050
DATABASE_URL=postgresql://user:password@localhost:5432/fm
JWT_SECRET=change-me
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Run

Development (watch mode):

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

On startup the server:

1. Checks the database connection
2. Runs pending SQL migrations from `migrations/`
3. Seeds data from `seeds/` when `NODE_ENV !== "production"`

Health check: `GET /api/health` → `{ "status": "ok" }`

## Project structure

```
src/
  server.ts              # App entry, mounts routes under /api
  db/
    connection.ts        # Postgres pool
    migrate.ts           # Applies migrations/*.sql
    seed.ts              # Applies seeds/*.sql (non-production)
  lib/
    tokens.ts            # JWT issue / verify / rotate / revoke
  middleware/
    requireAuth.ts       # Bearer access-token guard
  routes/                # Express routers
  types/                 # Shared TypeScript types
migrations/              # Ordered SQL migrations
seeds/                   # Dev seed SQL
```

All HTTP routes are mounted under `/api`.

## Authentication

Protected routes require:

```
Authorization: Bearer <accessToken>
```

### Token lifetimes

| Token | TTL | Notes |
|---|---|---|
| Access | 15 minutes | Sent as Bearer token |
| Refresh | 7 days | Stored hashed in `refresh_tokens`; rotated on refresh |

### Auth flow

1. **Signup** → creates unverified user and emails a 6-digit OTP (10 min TTL, 5 attempts max, 60s resend cooldown)
2. **Verify OTP** → marks email verified and returns `accessToken` + `refreshToken`
3. **Login** → requires verified email; returns token pair
4. **Refresh** → exchanges refresh token for a new pair (old refresh token revoked)
5. **Logout** → revokes the refresh token (idempotent)

---

## API reference

Base URL: `http://localhost:5050/api`

Unless noted, bodies and responses are JSON. Protected routes are marked **Auth**.

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Liveness check |

**Response:** `{ "status": "ok" }`

---

### Auth (`/auth`)

#### `POST /auth/signup`

Create a user and send a verification OTP. If the email exists but is unverified, resends the OTP (respecting cooldown).

**Body:**

```json
{
  "first_name": "Ada",
  "email": "ada@example.com",
  "password": "secret"
}
```

**Responses:** `201` (created), `200` (OTP resent), `400`, `409` (already registered), `429` (cooldown), `502` (email send failed)

#### `POST /auth/verify-otp`

**Body:** `{ "email": "...", "code": "123456" }`

**Response:** public user fields + `accessToken`, `refreshToken`, `message`

#### `POST /auth/resend-otp`

**Body:** `{ "email": "..." }`

#### `POST /auth/login`

**Body:** `{ "email": "...", "password": "..." }`

**Response:** public user + `accessToken`, `refreshToken`  
**Errors:** `401` invalid credentials, `403` email not verified

#### `POST /auth/refresh`

**Body:** `{ "refreshToken": "..." }`

**Response:** `{ "accessToken": "...", "refreshToken": "..." }`

#### `POST /auth/logout`

**Body:** `{ "refreshToken": "..." }`

**Response:** `{ "message": "Logged out successfully" }`

---

### Users (`/users`) — Auth

| Method | Path | Description |
|---|---|---|
| `GET` | `/users/me` | Current user (password hash omitted) |
| `PUT` | `/users/me` | Update `first_name`, `email`, and/or `password` |
| `DELETE` | `/users/me` | Delete account |

**PUT body (all fields optional):**

```json
{
  "first_name": "Ada",
  "email": "ada@example.com",
  "password": "new-secret"
}
```

---

### Exercises (`/exercises`) — Auth

Catalog of exercises (shared, not per-user).

| Method | Path | Description |
|---|---|---|
| `POST` | `/exercises` | Create |
| `GET` | `/exercises` | List all |
| `GET` | `/exercises/:id` | Get by id |
| `PUT` | `/exercises/:id` | Update |
| `DELETE` | `/exercises/:id` | Delete |

**Create/update body:**

```json
{
  "title": "Box Breathing",
  "exercise_description": "Inhale 4, hold 4, exhale 4, hold 4",
  "video_url": "https://...",
  "focus": "calm",
  "duration": 300
}
```

`video_url`, `focus`, and `duration` are optional.

---

### User exercises (`/userExercises`) — Auth

Links the authenticated user to exercises and tracks completions.

| Method | Path | Description |
|---|---|---|
| `POST` | `/userExercises` | Assign exercise (`{ "exercise_id": 1 }`) |
| `GET` | `/userExercises` | List for current user |
| `GET` | `/userExercises/:exerciseId` | Get one by exercise id |
| `PUT` | `/userExercises/:exerciseId` | Increment `times_completed` by 1 |
| `DELETE` | `/userExercises/:exerciseId` | Unassign |

Unique on `(user_id, exercise_id)`.

---

### Journals (`/journals`) — Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/journals` | Create (`{ "user_text": "..." }`) |
| `GET` | `/journals` | List for current user |
| `GET` | `/journals/:journalId` | Get one |
| `PUT` | `/journals/:journalId` | Update text |
| `DELETE` | `/journals/:journalId` | Delete |

---

### Messages (`/messages`) — Auth

Shared message/content catalog.

| Method | Path | Description |
|---|---|---|
| `POST` | `/messages` | Create |
| `GET` | `/messages` | List all |
| `GET` | `/messages/:id` | Get by id |
| `PUT` | `/messages/:id` | Update |
| `DELETE` | `/messages/:id` | Delete |

**Create body:**

```json
{
  "message_description": "Take a short break",
  "focus": "calm",
  "message_type": "prompt"
}
```

`focus` is optional; `message_type` is required.

---

### Habit goals (`/habitGoals`) — Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/habitGoals` | Create (`{ "habit_goals": { ... } }`) |
| `GET` | `/habitGoals` | List for current user |
| `GET` | `/habitGoals/:habitGoalId` | Get one |
| `PUT` | `/habitGoals/:habitGoalId` | Update JSON payload |
| `DELETE` | `/habitGoals/:habitGoalId` | Delete |

`habit_goals` is stored as JSONB (any JSON structure).

---

### Habits (`/habits`) — Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/habits` | Create (`{ "habits": { ... } }`) |
| `GET` | `/habits` | List for current user |
| `GET` | `/habits/:habitId` | Get one |
| `PUT` | `/habits/:habitId` | Update JSON payload |
| `DELETE` | `/habits/:habitId` | Delete |

`habits` is stored as JSONB (any JSON structure).

---

## Database

Migrations run automatically on startup and are tracked in a `migrations` table.

| File | Purpose |
|---|---|
| `001_init.sql` | Core tables: users, exercises, user_exercises, journals, messages, habit_goals, habits, user_otp |
| `002_email_verified_otp.sql` | Email verification + OTP (idempotent with init) |
| `003_refresh_tokens.sql` | Refresh token storage |

User-owned rows cascade-delete when a user is deleted.

### Public user shape

Password hashes are never returned from the API:

```ts
{
  id: number
  first_name: string
  email: string
  email_verified: boolean
  created_at: Date
  updated_at: Date
}
```

## Scripts

| Script | Command |
|---|---|
| Dev server | `npm run dev` |
| Compile | `npm run build` |
| Production server | `npm start` |

## Todos
- Security headers + tighten CORS (later - once deployed?)
- Request validation (zod?)
- DB for prod (SSL, Pool settings, graceful shutdown)
- Structured logging
- Body size limits
- Observability (Later)
- Secrets hygiene
- Migrations as deploy step