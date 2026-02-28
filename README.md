# QuickHire Job Board

QuickHire is a simple full-stack job board built with Next.js on the frontend and Express with PostgreSQL on the backend. It supports job browsing, keyword/category/location filters, job details, application submission, and a lightweight admin workflow for adding or deleting listings.

## Stack

- Next.js 16 + React 19 + Tailwind CSS 4
- Express 5
- PostgreSQL via `pg`

## Project Structure

- `client` - Next.js frontend
- `server` - Express API and PostgreSQL integration

## Setup

### 1. Backend

Create `server/.env` from `server/.env.example` and set the actual `DATABASE_URL`.

```bash
cd server
npm install
npm run dev
```

The API runs on `http://localhost:4000`.

Available endpoints:

- `GET /api/jobs`
- `GET /api/jobs/meta`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `DELETE /api/jobs/:id`
- `POST /api/applications`

### 2. Frontend

Create `client/.env.local` from `client/.env.local.example`.

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Notes

- The backend creates the required PostgreSQL tables on startup if they do not exist.
- Sample jobs are seeded only when the `jobs` table is empty.
- CORS is configurable through `CORS_ORIGIN` in `server/.env`.
