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

---

## ADR-010: Build the visitor cafe list from distinct active reports

- Date: 2026-05-19
- Status: accepted

### Context

The visitor experience needs to surface the cafes that currently have active reports, not just generic search results. The product also needs to treat multiple reports for the same cafe as one visible cafe entry.

### Decision

Add a dedicated `GET /api/cafes/active` endpoint that returns one entry per cafeId with active report counts and latest report time. Make the visitor page load this endpoint by default and show an empty state when no active reports exist.

### Reason

This keeps the visitor list aligned with real current activity, reduces duplicate cafes in the UI, and avoids mixing search results with active-report discovery.

### Alternatives Considered

- Keep the Naver search results as the default visitor list
- Merge active-report discovery and search into one endpoint
- Compute distinct cafes entirely in the client

### Impact

The server now exposes one more read API and the report store needs a list-all-active-cafes method. The client visitor screen now depends on active-report availability before rendering the default list.

---

## ADR-011: Reset page state on entry and cache visitor report details for 10 minutes

- Date: 2026-05-19
- Status: accepted

### Context

The app keeps multiple visitor and reporter flows in a single-page shell. Without explicit resets, stale cafe lists and selected cafe state can bleed across page entries. The visitor flow also benefits from a short-lived cache when the same cafe is clicked repeatedly.

### Decision

Reset cafe lists, selected cafe state, and transient messages each time a user enters a page mode. Cache `GET /api/cafes/:cafeId/reports` responses in the client for up to 10 minutes by `cafeId`.

### Reason

This keeps page transitions predictable and avoids showing stale search or selection state. A short-lived client cache reduces repeated fetches when the user revisits the same cafe, while still refreshing data frequently enough for a time-sensitive report product.

### Alternatives Considered

- Keep state across page entries
- Put the cache on the server
- Cache search results instead of cafe report details

### Impact

The visitor and reporter views now feel like separate entry states even inside one SPA. Repeated cafe clicks can reuse recent data for up to 10 minutes, which reduces server traffic and UI latency without changing the API contract.

---

## ADR-012: Evict cached cafe report details when a new report is submitted

- Date: 2026-05-19
- Status: accepted

### Context

The client caches visitor report responses by `cafeId` to avoid repeated fetches. That cache should not outlive a newer report submission for the same cafe.

### Decision

When a `곧 나가요` submission succeeds for a cafe, evict the cached report response for that same `cafeId`. The next cafe lookup must re-fetch from the server.

### Reason

This keeps the cache simple and safe. A successful report submission is the strongest signal that cached cafe detail data is stale.

### Alternatives Considered

- Invalidate the whole cache on every submit
- Keep the cached response and wait for TTL expiry
- Store cache metadata in the server instead of the client

### Impact

The client can still reuse recent cafe lookups, but a new report immediately forces a fresh read for the affected cafe. That reduces stale detail risk without giving up the performance benefit of the cache.

---

## ADR-013: Gate reporter submissions behind a 100m browser geolocation check

- Date: 2026-05-19
- Status: accepted

### Context

Reporter submissions need to be limited to people physically near the cafe. The client already receives cafe coordinates from search results, so the app can verify distance in the browser before allowing submission.

### Decision

Require the client to verify browser geolocation against the selected cafe coordinates and only allow submission when the user is within 100 meters.

### Reason

This matches the product goal of location-based reporting while keeping the first implementation simple. The browser can check the user position immediately without changing the server API contract.

### Alternatives Considered

- Verify location only after submit
- Send raw GPS coordinates to the server for validation
- Skip location enforcement until a later release

### Impact

The reporter flow now depends on browser geolocation support and cafe coordinates from search results. Users must confirm proximity before the submit button becomes active, and sample cafe data needs approximate coordinates for the local fallback flow.
