# Serene

A mood-tracking journaling app with AI-powered vibe checks.

## Local Development

### Prerequisites
- Node.js 20+
- Docker (for Postgres) or a Postgres instance

### Setup

```bash
# Install dependencies
npm install

# Copy env vars
cp .env.example .env.local
# Edit .env.local with your values

# Start Postgres (via Docker)
docker-compose up db -d

# Generate & run migrations
npm run db:generate
npm run db:migrate

# Start dev server
npm run dev
```

App runs at http://localhost:3000

### Database Studio

```bash
npm run db:studio
```

## Docker (Production)

```bash
docker-compose up --build
```

App runs at http://localhost:3000

## Environment Variables

See `.env.example` for all required variables.
