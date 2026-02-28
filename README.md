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

Copy `server/.env.example` to `server/.env` and set the actual `DATABASE_URL`:

```bash
cp server/.env.example server/.env
# Edit server/.env and fill in DATABASE_URL
```

Then start the server:

```bash
cd server
npm install
npm run dev
```

The API runs on `http://localhost:4000`.

Available endpoints:

- `GET /api/jobs` — list all jobs (supports `?search=`, `?category=`, `?location=`)
- `GET /api/jobs/meta` — distinct categories and locations
- `GET /api/jobs/:id` — single job detail
- `POST /api/jobs` — create a job listing
- `DELETE /api/jobs/:id` — delete a job listing
- `POST /api/applications` — submit a job application

### 2. Frontend

Copy `client/.env.local.example` to `client/.env.local`:

```bash
cp client/.env.local.example client/.env.local
```

Then start the frontend:

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Admin Panel

The admin panel is accessible at `/admin`. It is protected by a simple login:

| Field    | Value           |
|----------|-----------------|
| Username | `admin`         |
| Password | `quickhire2024` |

After signing in, you can add new job listings and delete existing ones. The session is stored in `sessionStorage` and clears when the browser tab is closed.

## Notes

- The backend creates the required PostgreSQL tables on startup if they do not exist.
- Sample jobs are seeded only when the `jobs` table is empty.
- CORS is configurable through `CORS_ORIGIN` in `server/.env`.
- `.env` and `.env.local` files are excluded from version control via `.gitignore`.
