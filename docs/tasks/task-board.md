# Task Board

## Status Legend

- TODO: Not started
- IN_PROGRESS: Currently being worked on
- DONE: Completed and verified
- BLOCKED: Cannot proceed without missing information
- DEFERRED: Intentionally postponed

## Priority Legend

- P0: urgent or blocking
- P1: important
- P2: normal
- P3: optional

## Type Legend

- feature
- bugfix
- refactor
- docs
- test
- infra
- chore

## Task List

| ID | Title | Type | Priority | Status | Owner | Related Docs | Notes |
|---|---|---|---|---|---|---|---|
| T-001 | Initialize Codex project documentation workflow | docs | P1 | DONE | Codex | `/AGENTS.md`, `/docs/*` | Initial project rules and docs structure created |
| T-002 | Define actual project goal and core features | docs | P1 | DONE | User/Codex | `/docs/project/overview.md` | Defined 곧나가요 goal, users, MVP features, and non-goals |
| T-003 | Initialize client framework | chore | P2 | DONE | Codex | `/client` | Current client framework is Vite React TypeScript with shadcn/ui |
| T-004 | Initialize server framework | chore | P2 | DONE | Codex | `/server` | Current server framework is Fastify TypeScript with Zod |
| T-005 | Build release1 MVP for cafe seat reports | feature | P1 | DONE | Codex | `/docs/plans/2026-05-16-release1-mvp.md`, `/client`, `/server` | Kakao cafe search, visitor flow, leaving report flow, in-memory reports |
| T-006 | Rebuild release1 with selected stack and shadcn UI | refactor | P1 | DONE | Codex | `/docs/plans/2026-05-16-release1-stack-rebuild.md`, `/client`, `/server` | Client: Vite React TS shadcn/ui. Server: Fastify TS Zod |
| T-007 | Configure Kakao key and improve mobile color UI | refactor | P1 | DONE | Codex | `/client`, `/docs/logs/2026-05.md` | Superseded by T-010 Naver search migration; mobile-first color UI retained |
| T-008 | Keep landing title on one mobile line | bugfix | P2 | DONE | Codex | `/client/src/App.tsx` | Removed forced mobile line break in brand title |
| T-009 | Update local Kakao JavaScript key | chore | P2 | DONE | Codex | `/client/.env.local` | Superseded by T-010; local Kakao key removed |
| T-010 | Migrate cafe search from Kakao SDK to Naver Local Search | refactor | P1 | DONE | Codex | `/client`, `/server`, `/docs` | Server-side Naver Local Search proxy implemented and verified |
| T-011 | Configure local Naver Search credentials | chore | P2 | DONE | Codex | `/server/.env` | Added local Naver credentials and verified live search |
| T-012 | Add Gemini AI cafe report summary | feature | P1 | DONE | Codex | `/server`, `/docs` | Gemini summaries implemented with rule-based fallback |
| T-013 | Improve cafe search UI feedback | bugfix | P2 | DONE | Codex | `/client/src/App.tsx` | Search API verified; client now shows search loading, success, and error messages |
| T-014 | Refine reporter page and cafe-tone styling | refactor | P2 | DONE | Codex | `/client/src/App.tsx`, `/client/src/index.css`, `/client/src/components/ui/*` | Hide summary/recent reports in reporter mode and strengthen coffee palette |
| T-015 | Remove reporter-side cafe report lookup | bugfix | P2 | DONE | Codex | `/client/src/App.tsx` | Reporter mode now only submits reports and no longer fetches summaries |
| T-016 | Remove summary from report registration response | bugfix | P2 | DONE | Codex | `/server/src/app.ts` | Report registration now returns only the created report |
| T-017 | Confirm report registration response shape | docs | P3 | DONE | Codex | `/docs/logs/2026-05.md` | Verified POST returns only report without summary |
| T-018 | Restore visitor summary lookup on cafe click | bugfix | P2 | DONE | Codex | `/client/src/App.tsx` | Visitor mode now fetches cafe reports again |
| T-019 | Return no-report message for empty cafe summaries | bugfix | P2 | DONE | Codex | `/server/src/domain.ts`, `/server/test/domain.test.ts` | Empty report sets now respond with a clear "아직 제보된 정보가 없어요" message |
| T-020 | Initialize local git repository and commit snapshot | chore | P3 | DONE | Codex | `/AGENTS.md`, `/docs/*`, `/client`, `/server` | Git repository initialized at project root and current work committed |
| T-021 | Plan Supabase persistence and cleanup rollout | docs | P2 | DONE | Codex | `/docs/plans/2026-05-17-supabase-persistence-cleanup.md` | Implementation plan written for storage persistence and cleanup |
| T-022 | Implement Supabase persistence and cleanup | feature | P1 | DONE | Codex | `/server`, `/docs` | Persist reports in Postgres and remove stale rows with a scheduled cleanup job |
| T-023 | Summarize deployment strategy and prerequisites | docs | P2 | DONE | Codex | `/docs/project/decisions.md`, `/docs/project/architecture.md`, `/docs/project/overview.md`, `/server/README.md` | Recommended Cloudflare Pages + Render Free + Supabase Free deployment path documented |
| T-024 | Stop local dev servers on ports 5173 and 4173 | chore | P3 | DONE | Codex | `/docs/logs/2026-05.md` | Stopped PID 96241 on 5173; verified no listeners on 5173 or 4173 |
| T-025 | Refresh mobile-first service design | refactor | P1 | DONE | Codex | `/client`, `/docs/plans/2026-05-18-service-design-refresh-design.md` | Redesign implemented as mobile-app simplicity with warm cafe brand expression |
| T-026 | Remove landing helper info and adjust palette | refactor | P1 | DONE | Codex | `/client`, `/docs/logs/2026-05.md` | Removed confusing landing helper blocks and shifted palette away from coffee/amber tones |
| T-027 | Simplify landing action buttons | refactor | P1 | DONE | Codex | `/client`, `/docs/logs/2026-05.md` | Removed redundant action labels while keeping landing cards clearly clickable |
| T-028 | Prepare and push deployment candidate | infra | P1 | BLOCKED | Codex | `/client`, `/server`, `/docs/logs/2026-05.md` | Pushed latest main branch; platform auto-deploy connection or Cloudflare token still required |
| T-029 | Remove cafe name from Naver cafe IDs | bugfix | P1 | DONE | Codex | `/server/src/naver.ts`, `/server/test/naver.test.ts` | Avoid Korean cafe names in URL/path/storage IDs for report lookup stability |
