# Server

Release1 uses a Fastify TypeScript API server.

## Responsibilities

- Provide JSON APIs for cafe seat reports.
- Proxy Naver Local Search API for cafe lookup.
- Store release1 reports in Supabase Postgres when configured, with memory fallback for local development.
- Generate practical visitor summaries from active reports.
- Validate report creation with Zod.

## Commands

```bash
npm run dev
npm run build
npm test
```

The local API runs at `http://127.0.0.1:3000` by default.

## Naver Search Setup

Copy `.env.example` to `.env` and set:

```bash
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
```

Without these values, cafe search returns a server error and the client falls back to sample cafes.

## Supabase Persistence Setup

Copy `.env.example` to `.env` and set:

```bash
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CLEANUP_SECRET=your-internal-cleanup-secret
```

If the Supabase values are missing, the server uses in-memory report storage for local development.

## Cleanup

The server exposes `POST /api/internal/cleanup/reports` for scheduled cleanup jobs. When `CLEANUP_SECRET` is set, the request must include `x-cleanup-secret` with the same value.
