# Architecture Decisions

## Decision Format

Each decision should follow this format:

```md
## ADR-000: Decision Title

- Date:
- Status: proposed | accepted | rejected | deprecated

### Context

Why this decision is needed.

### Decision

What we decided.

### Reason

Why this option was selected.

### Alternatives Considered

- Alternative 1
- Alternative 2

### Impact

Expected impact and trade-offs.
```

---

## ADR-001: Use `/client` and `/server` as top-level application boundaries

- Date: 2026-05-16
- Status: accepted

### Context

The project needs a clear full-stack structure that separates frontend and backend responsibilities.

### Decision

Use `/client` for frontend code and `/server` for backend code.

### Reason

This keeps application responsibilities explicit and makes it easier for Codex to locate the correct implementation area.

### Alternatives Considered

- Single application directory
- Domain-based root folders

### Impact

Frontend and backend changes must remain within their respective directories unless a cross-cutting change is explicitly required.

---

## ADR-002: Build release1 with a no-build static client and Node.js server

- Date: 2026-05-16
- Status: deprecated

### Context

Release1 needs to prove the MVP workflow quickly: visitors check cafe seat reports, and people leaving soon submit reports.

### Decision

Use a static HTML/CSS/JavaScript client and a Node.js built-in HTTP server for release1. Store reports in memory.

### Reason

This avoids dependency installation and keeps the MVP locally runnable while the product flow is still being validated.

### Alternatives Considered

- React/Vite client and Express server
- Full-stack framework
- Database-backed backend from release1

### Impact

Deprecated by ADR-004 and ADR-005 after the user requested explicit client/server stacks and shadcn/ui. Report data is still not durable and resets on server restart.

---

## ADR-003: Use Kakao Maps JavaScript API for cafe search in release1

- Date: 2026-05-16
- Status: deprecated

### Context

Cafe data should come from Kakao map search rather than a custom cafe database.

### Decision

Use the Kakao Maps JavaScript API services library on the client. Search uses `keywordSearch` with `category_group_code: "CE7"` for cafe filtering.

### Reason

The Kakao JavaScript SDK fits the browser-first MVP and avoids proxying Kakao requests through the backend in release1.

### Alternatives Considered

- Kakao Local REST API from the server
- Hardcoded cafe database
- Third-party place APIs

### Impact

Deprecated by ADR-006 after local Kakao JavaScript SDK domain issues blocked local development. The client includes sample cafes when external search is unavailable.

---

## ADR-006: Use Naver Local Search through the server for cafe search

- Date: 2026-05-17
- Status: accepted

### Context

The project needs platform-backed cafe lookup without building a custom cafe search system. Kakao Maps JavaScript SDK caused local domain issues during development.

### Decision

Use Naver Local Search API from the Fastify server. The client calls `GET /api/cafes/search?query=...`, and the server calls `https://openapi.naver.com/v1/search/local.json` with `X-Naver-Client-Id` and `X-Naver-Client-Secret`.

### Reason

This keeps API credentials off the client, avoids browser SDK domain issues, and lets the MVP focus on seat reports instead of implementing cafe search.

### Alternatives Considered

- Continue using Kakao Maps JavaScript SDK
- Use Kakao Local REST API
- Build an internal cafe database and search system

### Impact

Server search requires `NAVER_CLIENT_ID` and `NAVER_CLIENT_SECRET`. If they are missing or the API fails, the client falls back to sample cafes.

---

## ADR-007: Use Gemini for cafe report summaries with rule fallback

- Date: 2026-05-17
- Status: accepted

### Context

The MVP needs better visitor-facing summaries than fixed rule-based sentence templates, while still staying resilient to AI API failures and cost controls.

### Decision

Use Gemini `generateContent` from the Fastify server to summarize active cafe reports. The response keeps the existing summary stats and adds `source: "ai" | "rule"`. If Gemini is unavailable or returns an incomplete sentence, the server returns the existing rule-based summary.

### Reason

Gemini can synthesize multiple reports into a clearer visit recommendation, while fallback keeps the product usable during API errors, quota issues, or malformed model output.

### Alternatives Considered

- Keep only rule-based summaries
- Use OpenAI API
- Generate summaries directly in the client

### Impact

The server requires `GEMINI_API_KEY`. Summary calls add latency and external API dependency. Gemini 2.5 Flash thinking is disabled with `thinkingBudget: 0` for short summary responses.

---

## ADR-004: Use Vite React TypeScript with shadcn/ui for the client

- Date: 2026-05-16
- Status: accepted

### Context

The release1 client needs a deliberate frontend stack and should not use arbitrary custom UI primitives.

### Decision

Use Vite, React, TypeScript, Tailwind CSS v4, and shadcn/ui-style local components under `/client`.

### Reason

This keeps the frontend lightweight, typed, and aligned with shadcn's official Vite setup while preserving the `/client` project boundary.

### Alternatives Considered

- Keep the vanilla static frontend
- Use Next.js
- Use a prebuilt component library instead of shadcn/ui

### Impact

The client now requires dependency installation and a build step. UI primitives should be implemented through shadcn-compatible components in `src/components/ui`.

---

## ADR-005: Use Fastify TypeScript with Zod for the server

- Date: 2026-05-16
- Status: accepted

### Context

The release1 backend needs an explicit API stack while remaining small and testable.

### Decision

Use Fastify with TypeScript for HTTP routing, Zod for request validation, and Vitest for server tests.

### Reason

Fastify provides a focused API server without adding frontend concerns, and Zod keeps request validation close to the API contract.

### Alternatives Considered

- Keep the Node built-in HTTP server
- Use Express
- Add a database-backed framework immediately

### Impact

The server now has typed source files, a test runner, and a build step. Report storage remains in memory for release1.

---

## ADR-008: Persist reports in Supabase Postgres and clean stale rows with scheduled jobs

- Date: 2026-05-17
- Status: accepted

### Context

The MVP needs recent seat reports to survive server restarts, but stale reports should not accumulate forever.

### Decision

Store seat reports in Supabase Postgres when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured. Keep visitor-facing queries limited to active reports, and delete expired rows after a 24-hour retention window using a scheduled cleanup job.

### Reason

Supabase gives the project a low-cost durable database without changing the client API shape. A timed cleanup job keeps the table small while preserving recently expired data long enough for operational safety.

### Alternatives Considered

- Keep in-memory storage
- Use another managed SQL database
- Delete expired rows immediately with no retention window

### Impact

The server now depends on Supabase for production persistence. Local development still works without Supabase credentials by falling back to memory. Cleanup jobs can run through Supabase Cron or another scheduler that calls the cleanup endpoint.

---

## ADR-009: Deploy the client on Cloudflare Pages, the server on Render Free, and the database on Supabase Free

- Date: 2026-05-17
- Status: accepted

### Context

The application needs a low-cost deployment path that keeps the current Vite client and Fastify server mostly unchanged.

### Decision

Deploy the static client to Cloudflare Pages, the Node server to Render Free, and the persistent report database to Supabase Free. Run stale-report cleanup through Supabase Cron or a scheduled HTTP call to the cleanup endpoint.

### Reason

Cloudflare Pages serves the built client cheaply, Render Free can host the existing Node server without a rewrite, and Supabase provides durable storage with a free tier that is sufficient for the MVP. This keeps implementation effort low and preserves the current stack.

### Alternatives Considered

- Cloudflare Pages + Cloudflare Workers + D1
- Vercel + Render + Supabase
- Render only with a custom database host

### Impact

The client must know the deployed API base URL, and the server must be configured with Supabase and cleanup secrets in production. Render Free may spin down or suspend under its free-tier rules, so cold starts are possible.
