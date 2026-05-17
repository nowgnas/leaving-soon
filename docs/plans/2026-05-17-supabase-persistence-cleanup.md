# Supabase Persistence and Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Persist cafe seat reports in Supabase Postgres, keep visitor summaries based on fresh data, and remove stale reports automatically so the database stays small.

**Architecture:** Replace the in-memory report map in the server with a Supabase-backed reports repository. Visitor queries will read only active reports (`expires_at > now()`), and a scheduled cleanup job will delete rows older than the retention window. The client API shape stays the same; only server storage and cleanup behavior change.

**Tech Stack:** Fastify, TypeScript, Zod, Vitest, Supabase Postgres, Supabase Cron, `@supabase/supabase-js` or direct `fetch`/SQL depending on the server layer pattern.

---

### Task 1: Add Supabase-backed report storage

**Files:**
- Create: `server/src/repository.ts`
- Modify: `server/src/app.ts`
- Modify: `server/src/domain.ts`
- Modify: `server/src/types.ts`
- Modify: `server/package.json`
- Test: `server/test/domain.test.ts`
- Test: `server/test/repository.test.ts`

**Step 1: Write the failing test**

Create tests for inserting a report, fetching active reports by cafe id, and filtering expired reports from the persistence layer.

**Step 2: Run test to verify it fails**

Run: `npm test -- test/repository.test.ts`
Expected: FAIL because the repository module does not exist yet.

**Step 3: Write minimal implementation**

Implement a small repository module that wraps Supabase access for:
- inserting a `SeatReport`
- fetching active reports for a cafe
- optionally deleting expired rows during cleanup

**Step 4: Run test to verify it passes**

Run: `npm test -- test/repository.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add server/src/repository.ts server/src/app.ts server/src/domain.ts server/src/types.ts server/package.json server/test/domain.test.ts server/test/repository.test.ts
git commit -m "feat: persist seat reports in supabase"
```

### Task 2: Add cleanup policy and scheduled deletion job

**Files:**
- Create: `server/src/cleanup.ts`
- Modify: `server/src/app.ts`
- Create: `docs/project/decisions.md` entry
- Modify: `docs/project/architecture.md`
- Test: `server/test/cleanup.test.ts`

**Step 1: Write the failing test**

Create tests for:
- computing the cleanup cutoff time
- deleting reports older than `expires_at + 24h`
- leaving newer reports untouched

**Step 2: Run test to verify it fails**

Run: `npm test -- test/cleanup.test.ts`
Expected: FAIL because cleanup helpers do not exist yet.

**Step 3: Write minimal implementation**

Implement cleanup helpers and a protected maintenance route or SQL script path for scheduled deletion.

**Step 4: Run test to verify it passes**

Run: `npm test -- test/cleanup.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add server/src/cleanup.ts server/src/app.ts server/test/cleanup.test.ts docs/project/decisions.md docs/project/architecture.md
git commit -m "feat: add report cleanup policy"
```

### Task 3: Document deployment environment and verification

**Files:**
- Modify: `server/README.md`
- Modify: `docs/project/overview.md`
- Modify: `docs/tasks/task-board.md`
- Modify: `docs/logs/2026-05.md`

**Step 1: Write the documentation changes**

Document:
- required Supabase env vars
- retention window
- cleanup cadence
- how visitor summaries use only active reports

**Step 2: Run verification**

Run:
```bash
npm test
npm run build
```
Expected: both pass in `/server`; then run `npm run build` in `/client`.

**Step 3: Commit**

```bash
git add server/README.md docs/project/overview.md docs/tasks/task-board.md docs/logs/2026-05.md
git commit -m "docs: document persistence and cleanup flow"
```
