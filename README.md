# QuickHire Job Board

[![Watch the Demo on YouTube](https://img.shields.io/badge/Watch%20Demo-YouTube-red?logo=youtube)](https://youtu.be/hF60jNwiJtQ)

QuickHire is a full-stack job board built for the take-home task using:

- `Next.js 16` for the frontend
- `Express 5` for the backend API
- `PostgreSQL` for persistence

The application includes:

- job listing with search and filters
- job detail view
- job application form
- basic admin login and admin job management
- PostgreSQL-backed jobs and applications API

## Project Structure

- `client` - Next.js frontend
- `server` - Express API, validation, and PostgreSQL integration
- `instructions` - provided design/reference assets and task notes

## Features

### Frontend

- landing page inspired by the provided QuickHire design assets
- search by keyword
- filter by category and location
- featured jobs and latest jobs sections
- job detail page at `/jobs/[id]`
- application form with validation feedback
- admin login page at `/admin/login`
- admin panel at `/admin` for creating and deleting jobs

### Backend

- `GET /api/jobs`
- `GET /api/jobs/meta`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `DELETE /api/jobs/:id`
- `POST /api/applications`

### Database

- PostgreSQL tables are auto-created on server startup
- sample jobs are seeded only if the jobs table is empty
- applications are linked to jobs with a foreign key

## Local Setup

### 1. Backend

Create a backend env file from the example:

```bash
cp server/.env.example server/.env
```

Required backend environment variables:

```env
PORT=4000
DATABASE_URL=postgres://...
CORS_ORIGIN=http://localhost:3000
ADMIN_SECRET=quickhire-admin-secret
```

> `ADMIN_SECRET` is checked against the `X-Admin-Key` header on `POST /api/jobs` and `DELETE /api/jobs/:id`. Requests without a matching key receive a `401 Unauthorized` response.

Then install and run the server:

```bash
cd server
npm install
npm run dev
```

Backend runs on:

```txt
http://localhost:4000
```

### 2. Frontend

Create a frontend env file from the example:

```bash
cp client/.env.local.example client/.env.local
```

Required frontend environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_ADMIN_KEY=quickhire-admin-secret
```

> `NEXT_PUBLIC_ADMIN_KEY` must match the backend `ADMIN_SECRET` so the admin panel can create and delete jobs.

Then install and run the frontend:

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

## Admin Access

The admin panel uses a simple client-side session for this task.

| Field | Value |
| --- | --- |
| Username | `admin` |
| Password | `quickhire2024` |

After login, the session is stored in `sessionStorage`.

## Deployment Status

Current status:

- frontend is deployed
- backend is not deployed yet

Important note:

- the live frontend alone is not enough for full functionality
- job listing, job detail, application submission, and admin create/delete actions require the backend API to be deployed and reachable
- after backend deployment, `NEXT_PUBLIC_API_BASE_URL` must point to the public backend URL
- backend `CORS_ORIGIN` must be updated to the deployed frontend domain

Example production values:

```env
# frontend
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com

# backend
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

## Verification

Verified locally with:

- `npm run lint` in `client`
- `npx next build --webpack` in `client`
- `npm run check` in `server`
- backend startup against PostgreSQL
- `GET /api/health`
- `GET /api/jobs`

## Submission Notes

Per the task instructions, submission should include:

- public GitHub repository link
- short Loom or screen-recorded demo
- live link, if available

Suggested demo flow:

- browse job listings
- open a job detail page
- submit an application
- log in to admin
- create a job
- delete a job

## Notes

- `.env` files are gitignored
- the UI uses the provided assets from the `instructions` directory as visual reference
- the large provided SVG is included in the frontend as a design/reference asset
