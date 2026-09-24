# URL Shortener

A full-stack web application for shortening and managing URLs. Built with Node.js, Express, PostgreSQL, and React.

## Architecture

The project is structured into two main directories:

- `backend`: RESTful API server.
- `frontend`: Single Page Application (SPA) client.

## Features

- **Authentication**: JWT-based user registration and login securely stored in HTTP-only cookies.
- **URL Management**: Generate short identifiers for long URLs, manage active links.
- **Validation**: Strict request payload validation using Zod.
- **Structured Logging**: Comprehensive request and error logging via Pino.

## Technology Stack

**Backend:**

- Runtime/Framework: Node.js, Express.js
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JSON Web Tokens (JWT), bcrypt
- Validation: Zod
- Logging: Pino, pino-http
- Utils: nanoid

**Frontend:**

- Framework: React 19, Vite
- Routing: React Router DOM
- Data Fetching: Axios

## Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database (or compatible connection string e.g., Neon)

## Getting Started

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Configure environment variables. Create a `.env.development` (or `.env`) file in the `backend` directory:

```ini
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
BASE_URL=http://localhost:3000
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
```

Initialize the database and generate the Prisma client:

```bash
npx prisma generate
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

The backend server will run on `http://localhost:3000`.

### 2. Frontend Setup

Open a new terminal instance, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Configure environment variables. Create a `.env.development` file in the `frontend` directory:

```ini
VITE_BASE_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`.

## Available Scripts

- `npm run dev`: Starts the server in development mode with nodemon.
- `npm start`: Starts the server in production mode.
- `npm run postinstall`: Generates the Prisma client automatically after install.

### Frontend (`/frontend`)

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles and minifies for production.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint for code quality checks.
