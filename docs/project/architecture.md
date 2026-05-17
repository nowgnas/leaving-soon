# Architecture

## High-level Structure

```text
client  ->  server  ->  Naver Local Search API
client  ->  server  ->  Gemini API
client  ->  server  ->  Supabase Postgres report store
client  ->  server  ->  Supabase Cron cleanup job
```

## Client

The `/client` directory contains the frontend application.

Responsibilities:

- UI rendering
- User interaction
- API request handling
- Client-side state management
- Cafe place search through the server-side Naver Local Search API proxy

The client must not contain backend business logic.

Release1 uses a Vite React TypeScript client:

- `src/App.tsx`: Naver-backed cafe search, visitor flow, reporter flow, and API calls
- `src/components/ui/*`: shadcn/ui-style local UI primitives
- `src/index.css`: Tailwind CSS v4 theme and base styles
- `vite.config.ts`: React, Tailwind, alias, and API proxy configuration

## Server

The `/server` directory contains the backend application.

Responsibilities:

- API endpoints
- Business logic
- Persistence
- Authentication/authorization
- External service integration
- Server-side validation

The server must not contain frontend rendering logic.

Release1 uses a Fastify TypeScript API server:

- `src/domain.ts`: report validation, active-report filtering, and summary generation
- `src/summary.ts`: Gemini AI summary generation with rule-based fallback
- `src/app.ts`: Fastify API routing
- `src/repository.ts`: Supabase-backed report persistence with memory fallback for local development
- `src/cleanup.ts`: cleanup cutoff helper for stale report deletion
- `src/naver.ts`: Naver Local Search API client and cafe result normalization
- `src/server.ts`: local server entrypoint
- `src/types.ts`: shared server domain types
- Supabase Postgres report storage in deployment, in-memory fallback when Supabase env vars are missing

## API Flow

1. Client sends request to server.
2. Server validates request.
3. Server executes business logic.
4. Server returns response.
5. Client renders result.

## Release1 API

- `GET /api/health`
- `GET /api/cafes/search?query=:query`
- `GET /api/cafes/:id/reports`
- `POST /api/cafes/:id/reports`

## Cafe Search Flow

1. User enters from `카페 갈래요` or `곧 나가요`.
2. Client sends a search query to `GET /api/cafes/search`.
3. Server calls Naver Local Search API with `NAVER_CLIENT_ID` and `NAVER_CLIENT_SECRET`.
4. Server normalizes cafe-like local results and returns them to the client.
5. If Naver credentials are not configured, the client uses sample cafe data.

## Authentication/Authorization Flow

Release1 does not include authentication or authorization.

## Data Flow

1. Reporter selects a Naver cafe result or sample cafe.
2. Reporter submits leaving-soon details to the server.
3. Server validates and stores the report in Supabase Postgres, or in memory when Supabase env vars are missing.
4. Server generates a Gemini AI summary for active reports when possible.
5. Visitor selects the same cafe and receives active reports plus a summary.

## External Integrations

- Naver Local Search API for cafe place search.
- Gemini API `generateContent` for cafe report summaries.
- Supabase Postgres for durable report storage.
- Supabase Cron for stale-report cleanup.

## Important Technical Constraints

- Release1 report data is durable in Supabase when configured, but local development can still fall back to memory.
- Stale reports are deleted after the retention window by a scheduled cleanup job.
- Naver place search requires `NAVER_CLIENT_ID` and `NAVER_CLIENT_SECRET` on the server.
- Gemini summaries require `GEMINI_API_KEY` on the server.
- Supabase persistence requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on the server.
- Cleanup endpoints use `CLEANUP_SECRET` when configured.
- Local Naver credentials should be stored in `/server/.env`, which is excluded from git.
- Client and server require dependency installation and build steps.
- During development, the Vite client proxies `/api` requests to `http://127.0.0.1:3000`.

## Documentation Policy

Any architecture-level change must be recorded in `/docs/project/decisions.md`.
