# URL Shortener

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68A063?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite]()](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-6.3-CC3534?style=flat-square&logo=npm&logoColor=white)](https://docs.bullmq.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)

A high-performance, full-stack URL shortening platform engineered for sub-millisecond redirection, fault tolerance, and scalable analytics. The application implements a **cache-aside pattern** with Redis to bypass primary database lookups on hot URLs and uses **BullMQ** for asynchronous, background click tracking to keep the critical redirection path entirely non-blocking.

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
  - [High-Level Architecture](#high-level-architecture)
  - [Redirect & Analytics Sequence Flow](#redirect--analytics-sequence-flow)
  - [Database Schema (ERD)](#database-schema-erd)
- [Technology Stack](#technology-stack)
- [Key Design Decisions](#key-design-decisions)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
  - [Authentication Endpoints](#authentication-endpoints)
  - [URL Management & Redirection](#url-management--redirection)
  - [System Health](#system-health)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Infrastructure Setup (Redis)](#1-infrastructure-setup-redis)
  - [2. Backend Setup & Database Migration](#2-backend-setup--database-migration)
  - [3. Frontend Setup](#3-frontend-setup)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Troubleshooting & Verification](#troubleshooting--verification)

---

## Features

- ⚡ **Ultra-Fast Redirection**: Redis cache-aside layer resolves hot short links directly from memory.
- 📊 **Decoupled Asynchronous Analytics**: Link click increments are offloaded to BullMQ worker queues with exponential backoff retries.
- 🔒 **Dual-Token Authentication**: Stateless 5-minute Access Tokens with 5-day Refresh Tokens securely hashed using bcrypt prior to database storage.
- 🎯 **Custom Slugs & Random Nanoids**: Supports auto-generated collision-resistant 7-character Base62 keys or user-defined custom aliases.
- 🛡️ **Defensive Logging & Header Redaction**: Structured JSON logging powered by Pino with automatic masking of sensitive headers (`Authorization`, `Cookie`).
- 📱 **Modern Reactive UI**: Built with React 19, Vite, and React Router DOM with protected routing and session persistence.

---

## System Architecture

### High-Level Architecture

```mermaid
flowchart TD
    Client["Browser / Client Application"]

    subgraph Frontend["Frontend Layer (React 19 + Vite)"]
        UI["Single Page Application\n(React Router DOM v7)"]
        AxiosClient["Axios HTTP Client\n(withCredentials = true)"]
    end

    subgraph Backend["Backend Layer (Node.js + Express 5)"]
        API["Express 5 Gateway & Server"]

        subgraph Routes["REST Routing Handlers"]
            AuthRoute["/api/auth/*\nRegister · Login · Logout · Refresh · Profile"]
            UrlRoute["/api/urls/*\nCreate · Custom Slug · List · Stats · Delete"]
            RedirectRoute["GET /api/urls/:shortUrl\n(Critical Redirection Path)"]
            HealthCheck["GET /healthz\n(Liveness & Readiness)"]
        end

        subgraph Queues["Background Jobs & Workers"]
            BullQueue["BullMQ Queue\n('click-events')"]
            ClickWorker["Click Worker Process\n(Concurrency: 10 · Exponential Backoff)"]
        end
    end

    subgraph Storage["Data & Cache Layer"]
        RedisCache[("Redis 7 (ioredis)\nCache-Aside · 1 Hour TTL\nAppendOnly Persistence")]
        PostgresDB[("PostgreSQL Database\n(Prisma 7 ORM)")]
    end

    Client -->|"HTTP / HTTPS"| UI
    UI --> AxiosClient
    AxiosClient -->|"REST API Calls"| API

    API --> AuthRoute
    API --> UrlRoute
    API --> RedirectRoute
    API --> HealthCheck

    %% Redirect Flow
    RedirectRoute -->|"1. Check In-Memory Cache"| RedisCache
    RedisCache -.->|"Cache Hit: Instant Redirect 302"| Client
    RedisCache -.->|"Cache Miss"| PostgresDB
    PostgresDB -.->|"Write-Back to Cache (TTL 1h)"| RedisCache

    %% Async Worker Flow
    RedirectRoute -->|"2. Fire-and-Forget Job"| BullQueue
    BullQueue --> ClickWorker
    ClickWorker -->|"Asynchronously Increment Click Count"| PostgresDB

    %% Auth & CRUD Flow
    AuthRoute -->|"Read / Write Users & Hashed Refresh Tokens"| PostgresDB
    UrlRoute -->|"Read / Create / Delete URLs"| PostgresDB
    UrlRoute -->|"Evict Cache on Delete"| RedisCache
```

### Redirect & Analytics Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant API as Express API Server
    participant Redis as Redis Cache
    participant Queue as BullMQ ('click-events')
    participant DB as PostgreSQL (Prisma)
    participant Worker as Click Worker

    User->>API: GET /api/urls/:shortUrl
    API->>Redis: GET :shortUrl

    alt Cache Hit
        Redis-->>API: Returns longUrl
        API--)Queue: addClickJob(shortUrl) [Fire-and-forget]
        API-->>User: 302 Redirect to longUrl
    else Cache Miss
        Redis-->>API: null
        API->>DB: findUnique(shortUrl)
        DB-->>API: Record with longUrl
        API->>Redis: SET :shortUrl longUrl EX 3600
        API--)Queue: addClickJob(shortUrl) [Fire-and-forget]
        API-->>User: 302 Redirect to longUrl
    end

    Note over Queue,Worker: Asynchronous Background Processing
    Queue->>Worker: Process 'increment-click'
    Worker->>DB: UPDATE Url SET clicks = clicks + 1
    Worker-->>Queue: Job Completed
```

### Database Schema (ERD)

```mermaid
erDiagram
    User ||--o{ Url : "creates and owns"

    User {
        String id PK "UUID"
        String name "User full name"
        String email UK "Unique email address"
        String password "Bcrypt hashed password"
        String refreshToken UK "Bcrypt hashed refresh token (nullable)"
        DateTime createdAt "Timestamp default now()"
    }

    Url {
        String id PK "UUID"
        String longUrl "Destination target URL"
        String shortUrl UK "Unique full short URL or alias"
        Int clicks "Total redirect count default 0"
        DateTime createdAt "Timestamp default now()"
        String userId FK "Owner UUID (indexed)"
    }
```

---

## Technology Stack

### Backend Stack

| Category            | Technology                                                                                                        | Version     | Purpose / Architecture Role                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------- |
| **Runtime**         | [Node.js](https://nodejs.org/)                                                                                    | v18+ (ESM)  | Native ECMAScript Modules runtime environment                   |
| **Web Framework**   | [Express](https://expressjs.com/)                                                                                 | 5.2         | REST API router and HTTP server foundation                      |
| **Database**        | [PostgreSQL](https://www.postgresql.org/)                                                                         | 16+         | Relational primary data store for users and link mappings       |
| **ORM & Driver**    | [Prisma](https://www.prisma.io/) + `@prisma/adapter-pg`                                                           | 7.10        | Type-safe schema definition, migrations, and PostgreSQL adapter |
| **In-Memory Cache** | [Redis](https://redis.io/) / [ioredis](https://github.com/redis/ioredis)                                          | 7.0 / 6.0   | Sub-millisecond lookup cache for redirect resolution            |
| **Task Queue**      | [BullMQ](https://docs.bullmq.io/)                                                                                 | 6.3         | Persistent job queue for background asynchronous click tracking |
| **Authentication**  | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | 9.0 / 6.0   | Stateless dual-token JWT signing and credential hashing         |
| **Validation**      | [Zod](https://zod.dev/)                                                                                           | 4.6         | Schema-based request body validation middleware                 |
| **Logging**         | [Pino](https://getpino.io/) + [pino-http](https://github.com/pinojs/pino-http)                                    | 10.3 / 11.0 | Fast structured JSON logging with header redaction              |
| **Key Generation**  | [nanoid](https://github.com/ai/nanoid)                                                                            | 6.0         | Compact, collision-resistant URL slug generator                 |

### Frontend Stack

| Category            | Technology                                   | Version | Purpose / Architecture Role                                      |
| ------------------- | -------------------------------------------- | ------- | ---------------------------------------------------------------- |
| **UI Framework**    | [React](https://react.dev/)                  | 19.2    | Declarative component UI library                                 |
| **Build & Tooling** | [Vite](https://vitejs.dev/)                  | 8.3     | Lightning-fast development server and optimized rollup bundler   |
| **Client Routing**  | [React Router DOM](https://reactrouter.com/) | 7.18    | Single Page Application route navigation and auth guard wrappers |
| **HTTP Client**     | [Axios](https://axios-http.com/)             | 1.20    | Promise-based HTTP client configured with cookie credentials     |
| **Code Quality**    | [ESLint](https://eslint.org/)                | 10.10   | Code consistency and static analysis                             |

---

## Key Design Decisions

### 1. Cache-Aside Pattern with Automatic TTL

- **Why**: Under heavy traffic spikes, database lookups on the `/api/urls/:shortUrl` endpoint can become a major bottleneck.
- **Implementation**: The redirect route checks Redis first using the short code key. On a cache hit, the redirection response is sent immediately. On a cache miss, PostgreSQL is queried, and the result is stored in Redis with an `EX 3600` (1 hour) expiration.
- **Cache Invalidation**: When a user deletes a URL via `DELETE /api/urls/:id`, the key is immediately evicted from Redis (`redis.del`), guaranteeing stale URLs cannot be resolved.

### 2. Decoupled Click Analytics via BullMQ

- **Why**: Performing a database write (`UPDATE Url SET clicks = clicks + 1`) during a user's redirect introduces latency and locks database rows under high concurrency.
- **Implementation**: Redirect handlers dispatch a fire-and-forget job (`addClickJob`) into BullMQ's `click-events` queue. A dedicated background worker process consumes jobs with a concurrency setting of 10.
- **Resilience**: Configured with 3 attempts and exponential backoff (`delay: 1000ms`), with `removeOnFail: 100` so failures can be inspected without data loss.

### 3. Collision-Safe Short Code Generation

- **Why**: Distributed systems generating short codes risk collision if codes overlap.
- **Implementation**: 7-character Base62 alphanumeric IDs are generated with `nanoid`. Before insertion, the system verifies uniqueness, regenerating if a duplicate exists. Furthermore, a strict PostgreSQL `UNIQUE` constraint on `shortUrl` ensures race condition safety at the database tier.

### 4. Dual-Token Authentication with Hashed Storage

- **Why**: Prevents stolen refresh tokens from compromising long-term access while maintaining short access token validity.
- **Implementation**:
  - **Access Token**: 5-minute lifespan, transmitted via `httpOnly` secure cookies.
  - **Refresh Token**: 5-day lifespan. Critically, only the **bcrypt hash** of the refresh token is stored in the database (`User.refreshToken`), ensuring database leaks do not expose valid refresh credentials.
  - **Logout**: Invalidates the refresh token in the database and clears the client cookie.

### 5. Structured Logging & Secret Redaction

- **Why**: Production logs must be machine-parseable while preventing credential leaks.
- **Implementation**: `pino-http` emits structured JSON logs. Automatic redaction masks `req.headers.authorization` and `req.headers.cookie`. Routine health check requests (`/healthz`) are filtered from access logs to prevent log flooding.

### 6. Relational Indexing Strategy

- **Why**: Users frequently query lists and aggregated analytics of their own URLs.
- **Implementation**: An explicit index (`@@index([userId])`) is placed on the `Url` table in Prisma to keep queries like `WHERE userId = ?` performing at $O(\log N)$ rather than scanning the full table.

---

## Project Structure

```
URL-Shortener/
├── .agents/
│   └── rules/
│       └── github-readme-standards.md # Workspace rule defining documentation standards
├── AGENTS.md                          # Persistent agent behavioral guidelines
├── backend/
│   ├── prisma/
│   │   └── schema.prisma              # Database schema (User and Url models)
│   ├── src/
│   │   ├── config/
│   │   │   ├── cookie.config.js       # Cookie parser and HTTP-only configurations
│   │   │   ├── db.config.js           # Prisma client initialization with pg adapter
│   │   │   ├── env.config.js          # Centralized environment variable loader
│   │   │   ├── logger.config.js       # Pino structured logger instance
│   │   │   └── redis.config.js        # ioredis connection client
│   │   ├── errors/
│   │   │   └── app.error.js           # Custom AppError extending Error class
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js     # JWT token extraction and validation
│   │   │   ├── error-handler.middleware.js # Global error handler
│   │   │   └── validate.middleware.js # Zod validation middleware
│   │   ├── queues/
│   │   │   └── click.queue.js         # BullMQ queue definition & job enqueue helpers
│   │   ├── routes/
│   │   │   ├── auth.routes.js         # Authentication endpoints
│   │   │   ├── healthz.routes.js      # Liveness and health check endpoint
│   │   │   └── url.routes.js          # URL creation, redirection, stats, deletion
│   │   ├── utils/
│   │   │   ├── gen-short-url.util.js  # Nanoid short URL generator
│   │   │   ├── hash-value.util.js     # Bcrypt hash utility
│   │   │   └── validate-url.util.js   # URL format validator
│   │   ├── validations/
│   │   │   └── auth.validation.js     # Zod register and login validation schemas
│   │   ├── workers/
│   │   │   └── click.worker.js        # BullMQ background worker for click updates
│   │   └── app.js                     # Express application definition and middleware
│   ├── docker-compose.yml             # Redis 7 container configuration
│   ├── package.json                   # Backend dependencies and run scripts
│   ├── prisma7.config.ts              # Prisma 7 configuration file
│   └── server.js                      # Application entry point: DB connect & listen
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/                  # Login, Register, Protected Route components
│   │   │   └── url/                   # URL shortener dashboard, forms, link list
│   │   ├── routes.jsx                 # Client-side router hierarchy
│   │   ├── App.jsx                    # Root React component
│   │   └── main.jsx                   # React DOM entry point
│   ├── index.html                     # HTML template
│   ├── package.json                   # Frontend dependencies and Vite scripts
│   └── vite.config.js                 # Vite build and plugin setup
└── README.md                          # Primary repository documentation
```

---

## API Reference

### Authentication Endpoints

Base path: `/api/auth`

| Method | Endpoint    | Access        | Request Body                | Description                                                                       |
| ------ | ----------- | ------------- | --------------------------- | --------------------------------------------------------------------------------- |
| `POST` | `/register` | Public        | `{ name, email, password }` | Registers user, hashes password, sets access cookie, returns user & refresh token |
| `POST` | `/login`    | Public        | `{ email, password }`       | Verifies credentials, sets access cookie, returns user & refresh token            |
| `POST` | `/refresh`  | Public        | `{ refreshToken }`          | Validates refresh token against hashed DB record and issues new access token      |
| `GET`  | `/logout`   | Authenticated | None                        | Clears access cookie and nullifies stored refresh token                           |
| `GET`  | `/get-me`   | Authenticated | None                        | Returns the currently authenticated user profile                                  |

### URL Management & Redirection

Base path: `/api/urls`

| Method   | Endpoint        | Access        | Parameters / Body                        | Description                                                                                 |
| -------- | --------------- | ------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `POST`   | `/create`       | Authenticated | Body: `{ url: string }`                  | Generates a 7-character short URL code                                                      |
| `POST`   | `/create/:slug` | Authenticated | Param: `slug`<br>Body: `{ url: string }` | Creates a custom slug short URL                                                             |
| `GET`    | `/`             | Authenticated | None                                     | Retrieves all shortened URLs belonging to the authenticated user                            |
| `GET`    | `/stats`        | Authenticated | None                                     | Returns aggregated `{ totalClicks, totalLinks }` for the user                               |
| `DELETE` | `/:id`          | Authenticated | Param: `id` (UUID)                       | Deletes URL record and invalidates corresponding Redis cache                                |
| `GET`    | `/:shortUrl`    | Public        | Param: `shortUrl` (Slug)                 | **Redirect endpoint**: Resolves URL via cache/DB, triggers async analytics, redirects (302) |

### System Health

| Method | Endpoint   | Access | Description                                         |
| ------ | ---------- | ------ | --------------------------------------------------- |
| `GET`  | `/healthz` | Public | Returns `200 OK` status. Excluded from access logs. |

---

## Getting Started

### Prerequisites

Ensure you have the following installed locally:

- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [Docker & Docker Compose](https://www.docker.com/) (for running Redis)
- [PostgreSQL](https://www.postgresql.org/) v14+ database instance (local or hosted e.g. Supabase, Neon)

---

### 1. Infrastructure Setup (Redis)

Start the persistent Redis 7 container:

```bash
cd backend
docker compose up -d
```

Verify that Redis is healthy:

```bash
docker ps --filter "name=redis"
```

---

### 2. Backend Setup & Database Migration

1. Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

2. Create an environment configuration file `.env.development` in `backend/`:

```ini
PORT=3000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_replace_in_production
BASE_URL=http://localhost:3000
DATABASE_URL="postgresql://username:password@localhost:5432/urlshortener?sslmode=disable"
REDIS_URL=redis://localhost:6379
```

3. Synchronize the Prisma schema with your PostgreSQL database:

```bash
npx prisma db push
```

4. Start the backend development server (with Nodemon hot-reload and BullMQ click worker):

```bash
npm run dev
```

The backend API will start on **`http://localhost:3000`**.

---

### 3. Frontend Setup

1. Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

2. Create `.env.development` in `frontend/`:

```ini
VITE_BASE_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3000
```

3. Start the Vite development server:

```bash
npm run dev
```

The frontend application will be accessible at **`http://localhost:5173`**.

---

## Available Scripts

### Backend (`/backend`)

| Command               | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| `npm run dev`         | Runs backend in development mode with nodemon and `NODE_ENV=development` |
| `npm start`           | Runs backend in production mode with `NODE_ENV=production`               |
| `npm run postinstall` | Automatically executes `npx prisma generate` after package installation  |

### Frontend (`/frontend`)

| Command           | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `npm run dev`     | Starts local Vite dev server with hot module replacement (HMR)           |
| `npm run build`   | Compiles and minifies React application into production assets (`/dist`) |
| `npm run preview` | Locally serves production build for testing                              |
| `npm run lint`    | Runs ESLint across all JavaScript/JSX source files                       |

---

## Environment Variables

### Backend Configuration (`backend/.env.development` / `backend/.env.production`)

| Variable       | Type   | Required | Description                                         | Example                               |
| -------------- | ------ | -------- | --------------------------------------------------- | ------------------------------------- |
| `PORT`         | Number | Yes      | Port where the Express API server listens           | `3000`                                |
| `NODE_ENV`     | String | Yes      | Runtime environment mode                            | `development` / `production`          |
| `JWT_SECRET`   | String | Yes      | Secret signing key for Access and Refresh tokens    | `your_secret_key`                     |
| `BASE_URL`     | String | Yes      | Fully-qualified public URL used to form short links | `http://localhost:3000`               |
| `DATABASE_URL` | String | Yes      | PostgreSQL connection string                        | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL`    | String | Yes      | Redis connection URI                                | `redis://localhost:6379`              |

### Frontend Configuration (`frontend/.env.development` / `frontend/.env.production`)

| Variable            | Type   | Required | Description                            | Example                 |
| ------------------- | ------ | -------- | -------------------------------------- | ----------------------- |
| `VITE_BASE_URL`     | String | Yes      | Public URL of the frontend application | `http://localhost:5173` |
| `VITE_API_BASE_URL` | String | Yes      | Target backend API base URL            | `http://localhost:3000` |

---

## Troubleshooting & Verification

- **Verify API Health**:
  ```bash
  curl -i http://localhost:3000/healthz
  # Expected: HTTP/1.1 200 OK
  ```
- **Test Redis Connectivity**:
  ```bash
  docker exec -it redis redis-cli ping
  # Expected: PONG
  ```
- **Database Connection Error**:
  Ensure your `DATABASE_URL` contains valid credentials and SSL flags appropriate for your Postgres provider (e.g., `?sslmode=require` for hosted providers or `?sslmode=disable` for local Docker instances).
