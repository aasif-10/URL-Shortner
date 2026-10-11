# URL Shortener

A full-stack URL shortening service built for performance and reliability. The redirect path is backed by a Redis cache-aside layer, and click analytics are processed asynchronously via a BullMQ queue — keeping the hot path free of blocking database writes.

---

## Architecture

```mermaid
flowchart TD
    Client["Browser / Client"]

    subgraph Frontend["Frontend  (React 19 + Vite)"]
        UI["SPA — React Router DOM"]
    end

    subgraph Backend["Backend  (Node.js + Express 5)"]
        API["Express API Server"]

        subgraph Routes["Route Handlers"]
            AuthR["POST /api/auth/*\nRegister · Login · Logout · Refresh"]
            UrlR["POST /api/urls/create\nGET  /api/urls\nGET  /api/urls/stats\nDELETE /api/urls/:id"]
            RedirectR["GET /api/urls/:shortUrl\n(redirect path)"]
            Healthz["GET /healthz"]
        end

        subgraph Queue["Async Click Analytics"]
            BullMQ["BullMQ Queue\n(click-events)"]
            Worker["Click Worker\n(exponential backoff · 3 attempts)"]
        end
    end

    subgraph DataLayer["Data Layer"]
        Redis["Redis 7\n(cache-aside · TTL 1 h)"]
        Postgres["PostgreSQL\n(Prisma ORM)"]
    end

    Client -->|"HTTP"| UI
    UI -->|"Axios + credentials"| API
    API --> AuthR
    API --> UrlR
    API --> RedirectR
    API --> Healthz

    RedirectR -->|"1. Cache lookup"| Redis
    Redis -->|"Cache hit → redirect"| Client
    Redis -->|"Cache miss"| Postgres
    Postgres -->|"longUrl → set cache"| Redis
    RedirectR -->|"2. Fire-and-forget"| BullMQ
    BullMQ --> Worker
    Worker -->|"INCREMENT clicks"| Postgres

    AuthR --> Postgres
    UrlR --> Postgres
    UrlR -->|"DELETE → evict key"| Redis
```

---

## Technology Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | PostgreSQL (via Prisma 7 + `@prisma/adapter-pg`) |
| Cache | Redis 7 (ioredis) |
| Queue | BullMQ 6 |
| Auth | JWT (access: 5 m · refresh: 5 d) + bcrypt |
| Validation | Zod 4 |
| Logging | Pino + pino-http (structured JSON) |
| Short-code generation | nanoid |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router DOM 7 |
| HTTP client | Axios |

---

## Key Design Decisions

**Cache-aside redirect path**
Every redirect first checks Redis. On a cache hit, the response is sent immediately and a click job is enqueued fire-and-forget. On a miss, the record is fetched from PostgreSQL, written to Redis with a 1-hour TTL, and then the redirect is issued. The database is never in the critical path for warm keys.

**Async click analytics**
Click counts are incremented by a dedicated BullMQ worker, completely decoupled from the redirect response. The worker retries up to 3 times with exponential backoff (base 1 s) before marking a job as failed and retaining it for inspection (`removeOnFail: 100`).

**Collision-safe short codes**
7-character Base62 codes are generated via nanoid. A uniqueness constraint on `shortUrl` in PostgreSQL is the authoritative guard; the application retries generation in the unlikely event of a collision.

**Dual-token auth**
Access tokens expire in 5 minutes. Refresh tokens (5-day TTL) are bcrypt-hashed before storage so the plaintext token is never persisted in the database.

**Structured logging with secret redaction**
pino-http automatically redacts `authorization` and `cookie` headers from all request logs. Health check requests (`/healthz`) are excluded from access logs to reduce noise.

---

## Project Structure

```
.
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # User and Url models
│   ├── src/
│   │   ├── config/                # env, db, redis, logger, cookie
│   │   ├── errors/                # AppError class
│   │   ├── middlewares/           # auth, error handler, validation
│   │   ├── queues/
│   │   │   └── click.queue.js     # BullMQ queue + addClickJob helper
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── url.routes.js
│   │   │   └── healthz.routes.js
│   │   ├── utils/                 # genShortUrl, validateUrl, hashValue
│   │   ├── validations/           # Zod schemas (auth)
│   │   ├── workers/
│   │   │   └── click.worker.js    # BullMQ worker process
│   │   └── app.js
│   ├── server.js                  # Entry point — connects DB, starts worker
│   └── docker-compose.yml         # Redis 7 (appendonly persistence)
└── frontend/
    └── src/
```

---

## API Reference

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | Public | Register a new user |
| `POST` | `/login` | Public | Login and receive tokens |
| `GET` | `/logout` | Required | Clear session and invalidate refresh token |
| `POST` | `/refresh` | Public | Issue a new access token from a valid refresh token |
| `GET` | `/get-me` | Required | Return the authenticated user's profile |

### URLs — `/api/urls`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/create` | Required | Generate a short URL (auto-generated code) |
| `POST` | `/create/:slug` | Required | Generate a short URL with a custom slug |
| `GET` | `/` | Required | List all short URLs for the authenticated user |
| `GET` | `/stats` | Required | Return total clicks and total link count |
| `DELETE` | `/:id` | Required | Delete a short URL and evict its Redis cache entry |
| `GET` | `/:shortUrl` | Public | Redirect to the original long URL |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/healthz` | Returns `200 OK`. Excluded from access logs. |

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database
- Redis 7 (or use the provided Docker Compose file)

### 1. Start Redis

```bash
cd backend
docker compose up -d
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env.development` in `backend/`:

```ini
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
BASE_URL=http://localhost:3000
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
REDIS_URL=redis://localhost:6379
```

Push the schema and generate the Prisma client:

```bash
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

> The API server runs on `http://localhost:3000`. The BullMQ click worker starts automatically with the server.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.development` in `frontend/`:

```ini
VITE_BASE_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

> The frontend runs on `http://localhost:5173`.

---

## Available Scripts

### Backend (`/backend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server with nodemon in development mode |
| `npm start` | Start server in production mode |
| `npm run postinstall` | Auto-generate Prisma client after install |

### Frontend (`/frontend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Compile and minify for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Port the Express server listens on |
| `NODE_ENV` | Yes | `development` or `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `BASE_URL` | Yes | Public base URL of the API (used in short URL construction) |
| `REDIS_URL` | Yes | Redis connection URL |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BASE_URL` | Yes | Public URL of the frontend |
| `VITE_API_BASE_URL` | Yes | URL of the backend API |
