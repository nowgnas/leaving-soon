# Server

Release1 uses a Fastify TypeScript API server.

## Responsibilities

- Provide JSON APIs for cafe seat reports.
- Proxy Naver Local Search API for cafe lookup.
- Store release1 reports in memory.
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
