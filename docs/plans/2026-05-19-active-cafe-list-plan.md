# Distinct Active Cafe List Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show only distinct cafes that currently have active reports in the "카페 갈래요" visitor list, and show an empty state when none are active.

**Architecture:** Add a server endpoint that returns unique cafes derived from active reports, with one record per cafe. The client will use that endpoint as the default source for the visitor list, while keeping the existing cafe search flow available for manual search. Empty-state messaging stays on the client so the list can explain when there are no active reports.

**Tech Stack:** Fastify, TypeScript, React, Vite, existing in-memory/Supabase report store

---

### Task 1: Add a distinct active cafe listing API

**Files:**
- Modify: `server/src/repository.ts`
- Modify: `server/src/app.ts`
- Test: `server/test/app.test.ts`

**Step 1: Write the failing test**

Add a test that seeds two active reports for the same cafe and one for a different cafe, then asserts the new endpoint returns only two distinct cafes.

**Step 2: Run the targeted test to verify it fails**

Run: `cd server && npm test -- --runInBand app.test.ts`
Expected: fail because the endpoint does not exist yet.

**Step 3: Write the minimal implementation**

Add a `listActiveCafes()` method to the report store and a `GET /api/cafes/active` route that returns unique cafes with the latest known name and active report count.

**Step 4: Run the targeted test to verify it passes**

Run: `cd server && npm test -- --runInBand app.test.ts`
Expected: pass.

**Step 5: Commit**

```bash
git add server/src/repository.ts server/src/app.ts server/test/app.test.ts
git commit -m "feat: add distinct active cafe list api"
```

### Task 2: Make the visitor list use active cafes by default

**Files:**
- Modify: `client/src/App.tsx`

**Step 1: Write the failing test or reproduce manually**

There is no client test harness in this repo, so verify the visitor list behavior in the browser after the API exists.

**Step 2: Write the minimal implementation**

Fetch `/api/cafes/active` when entering visitor mode and when clearing search, render the returned cafes in the list, and show a message like `등록된 제보가 없어요` when the array is empty.

**Step 3: Verify in the browser**

Run the client and confirm the visitor list shows distinct active cafes, and that the empty state appears when no reports are active.

**Step 4: Commit**

```bash
git add client/src/App.tsx
git commit -m "feat: show active cafes in visitor list"
```
