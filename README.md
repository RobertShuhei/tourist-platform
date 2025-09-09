# Tourist Platform

AI-powered platform for inbound tourism in Japan.

## Architecture

This is a monorepo containing:

- `apps/api` - FastAPI backend with SQLAlchemy
- `apps/web` - Next.js frontend with TypeScript
- `infra/` - Infrastructure configuration

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL with PostGIS and pgvector extensions
- **Infrastructure**: Docker, Docker Compose

## Getting Started

1. Clone the repository
2. Run the development environment:
   ```bash
   npm run dev
   ```

This will start all services using Docker Compose:
- API: http://localhost:8000
- Web: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Available Scripts

- `npm run dev` - Start all services with Docker Compose
- `npm run dev:api` - Run API locally (requires PostgreSQL)
- `npm run dev:web` - Run web app locally
- `npm run build` - Build Docker images
- `npm run start` - Start production containers
- `npm run stop` - Stop all containers
- `npm run clean` - Stop and remove all containers, volumes, and images
- `npm run logs` - View container logs

## Database

PostgreSQL with extensions:
- **PostGIS** - Geospatial data support
- **pgvector** - Vector similarity search for AI features