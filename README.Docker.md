# Docker Setup Guide

This guide explains how to run the application using Docker and Docker Compose. The setup includes **Backend** and **Frontend** only; no Postgres or Metabase. The database must be provided externally (e.g. Cloud SQL) via environment variables.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB of available RAM
- At least 10GB of available disk space

## Quick Start

### Server + Client (from repo root)

1. Copy environment variables and set your database URL:

   ```bash
   cp .env.example .env
   # Edit .env and set DATABASE_URL (e.g. your Cloud SQL or external Postgres connection string)
   ```

2. Build and start backend and frontend:

   ```bash
   docker compose up --build -d
   ```

3. Access the services:
   - Frontend: http://localhost:4000
   - Backend API: http://localhost:3000

### Server only (from server directory)

To run only the backend (e.g. for development or Cloud Run–style single service):

1. From the `server/` directory, ensure `DATABASE_URL` (or `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) is set in your environment or in a `.env` file in `server/` or the current directory.

2. Start the server:

   ```bash
   cd server
   docker compose up -d
   ```

3. Backend API: http://localhost:3000

## Architecture

The Docker setup includes:

- **Backend** (`server/`): Node.js/Express API with TypeScript. Runs with `NODE_ENV=production` in Docker.
- **Frontend** (`client/`): React application served via Nginx. Exposed on port 4000 (root compose) with `NODE_ENV=production`.

There is **no** PostgreSQL or Metabase in the Docker setup; the backend expects a database to be provided via environment variables.

## Project structure

```
.
├── docker-compose.yml          # Root: backend + frontend
├── .env.example                # Environment variables template (if present)
├── server/
│   ├── Dockerfile
│   ├── docker-compose.yml      # Server only: backend
│   └── .dockerignore
└── client/
    ├── Dockerfile
    └── .dockerignore
```

## Configuration

### Environment variables

- **Backend (required for DB):** `DATABASE_URL` (full connection string), or `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- **Backend (optional):** `PORT` or `SERVER_PORT` (default 3000), `CORS_ORIGIN` (default http://localhost:4000), `NODE_ENV` (set to `production` in Docker).
- **Frontend:** `REACT_APP_API_URL`, `REACT_APP_WS_URL` (e.g. http://localhost:3000 for local backend).

Docker Compose sets `NODE_ENV=production` for both backend and frontend.

### Service dependencies

- Frontend depends on Backend (root compose).
- Backend has no service dependencies; it only needs a valid database reachable via the configured env vars.

## Health checks

- **Backend:** `GET /health`
- **Frontend:** Nginx health check on container port 5000

## Development

### Rebuild a specific service

```bash
# From repo root
docker compose build backend
docker compose up -d backend
```

### View logs

```bash
docker compose logs -f
docker compose logs -f backend
```

### Run a shell in the backend container

```bash
docker compose exec backend sh
```

## Deploy server to Google Cloud Run

1. Build the server image (e.g. from repo root):

   ```bash
   docker build -t gcr.io/YOUR_PROJECT_ID/kerygma-server ./server
   ```

2. Push to Artifact Registry (or Container Registry):

   ```bash
   docker push gcr.io/YOUR_PROJECT_ID/kerygma-server
   ```

3. Create a Cloud Run service from that image. Configure:
   - **Port:** Cloud Run sets `PORT` (e.g. 8080); the server reads `process.env.PORT`, so no extra config is needed.
   - **Environment variables / Secret Manager:** Set `DATABASE_URL` (e.g. Cloud SQL connection string) and any other required env vars (e.g. `CORS_ORIGIN`, secrets for email, etc.).

4. If you use Secret Manager, map the secret to `DATABASE_URL` in the Cloud Run service.

The server Dockerfile and app are already compatible with Cloud Run (single container, respects `PORT`).

## Security and production

1. Never commit `.env` or secrets to version control.
2. Use Secret Manager or env vars for `DATABASE_URL` and other secrets in production.
3. Containers run as non-root (configured in Dockerfiles).
4. Keep images and base images updated.

## Troubleshooting

### Port conflicts

Change the host port in `docker-compose.yml` (e.g. `4000:5000` for frontend, `3000:3000` for backend).

### Backend can't connect to the database

- Ensure `DATABASE_URL` (or `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) is set in the environment used by the backend container.
- For Cloud Run, ensure the service has network access to your database (e.g. VPC connector for Cloud SQL).

### Frontend can't reach the backend

Set `REACT_APP_API_URL` and `REACT_APP_WS_URL` to the backend URL (e.g. `http://localhost:3000` for local). For production, use the public backend URL; rebuild the frontend image if these are build-time args.
