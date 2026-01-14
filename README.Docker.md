# Docker Setup Guide

This guide explains how to run the Kerygma API monorepo using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB of available RAM
- At least 10GB of available disk space

## 🚀 Quick Start

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your desired configuration (especially passwords for production)

3. **Build and start all services:**
   ```bash
   docker compose up --build
   ```

4. **Access the services:**
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:3000
   - Metabase: http://localhost:3002

## 🏗️ Architecture

The Docker setup includes:

- **Backend** (`server/`): Node.js/Express API with TypeScript
- **Frontend** (`client/`): React application served via Nginx
- **PostgreSQL**: Database (not exposed externally)
- **Metabase**: Business intelligence and analytics (port 3002)

## 📁 Project Structure

```
.
├── docker-compose.yml          # Main Docker Compose configuration
├── .env.example                # Environment variables template
├── server/
│   ├── Dockerfile              # Backend container definition
│   └── .dockerignore
└── client/
    ├── Dockerfile              # Frontend container definition
    └── .dockerignore
```

## 🔧 Configuration

### Environment Variables

All configuration is done through the `.env` file. Key variables:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: Database credentials
- `REACT_APP_API_URL`: Frontend API endpoint
- `REACT_APP_WS_URL`: WebSocket endpoint
- `NODE_ENV`: Node.js environment (production/development)

### Service Dependencies

- Backend waits for PostgreSQL to be healthy before starting
- Frontend depends on Backend
- Metabase depends on PostgreSQL

## 🔍 Health Checks

All services include health checks:

- **Backend**: `GET /health` endpoint
- **Frontend**: Nginx health endpoint
- **PostgreSQL**: `pg_isready` command
- **Metabase**: API health endpoint

## 📊 Analytics

### Metabase

Metabase connects to PostgreSQL and can query the application database. Access at http://localhost:3002 and follow the setup wizard.

## 🗄️ Data Persistence

All data is persisted in Docker volumes:

- `postgres_data`: Database data
- `metabase_data`: Metabase configuration

To remove all data:
```bash
docker compose down -v
```

## 🛠️ Development

### Rebuild a specific service:
```bash
docker compose build backend
docker compose up backend
```

### View logs:
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
```

### Execute commands in containers:
```bash
# Backend shell
docker compose exec backend sh

# Database shell
docker compose exec postgres psql -U postgres -d kerygma
```

## 🔒 Security Best Practices

1. **Change default passwords** in `.env` for production
2. **Never commit `.env`** to version control
3. **Use secrets management** in production (Docker Swarm secrets, Kubernetes secrets, etc.)
4. **Run containers as non-root** (already configured in Dockerfiles)
5. **Keep images updated** regularly

## 🐛 Troubleshooting

### Port conflicts
If ports are already in use, modify port mappings in `docker-compose.yml`:
```yaml
ports:
  - "3000:3000"  # Change first number to available port
```

### Services not starting
Check logs:
```bash
docker compose logs [service-name]
```

### Database connection issues
Ensure PostgreSQL is healthy:
```bash
docker compose ps postgres
```

### Frontend can't connect to backend
Check that `REACT_APP_API_URL` and `REACT_APP_WS_URL` in `.env` match your setup.

## 📝 Notes

- The backend uses multi-stage builds for optimized production images
- Frontend is built and served via Nginx for production
- All services communicate via internal Docker network (`kerygma-network`)
- PostgreSQL is not exposed externally for security

## 🚀 Production Deployment

For production:

1. Use environment-specific `.env` files
2. Enable SSL/TLS (use reverse proxy like Traefik or Nginx)
3. Set up proper backup strategy for volumes
4. Configure resource limits in `docker-compose.yml`
5. Use Docker secrets for sensitive data
6. Set up log aggregation
7. Configure monitoring alerts



