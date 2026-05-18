# Service Design Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the existing 곧나가요 client so it feels like a warm, mobile-first cafe utility without changing the core visitor or reporter behavior.

**Architecture:** Keep the single React application in `client/src/App.tsx` and update Tailwind class composition around the existing state and API calls. Keep global design tokens in `client/src/index.css`; do not add new routes, backend APIs, or asset folders.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS v4, shadcn/ui local components, lucide-react.

---

### Task 1: Track the Design Refresh Task

**Files:**
- Modify: `docs/tasks/task-board.md`
- Modify: `docs/logs/2026-05.md`

**Step 1: Add task board entry**

Add `T-025` with:

- Title: `Refresh mobile-first service design`
- Type: `refactor`
- Priority: `P1`
- Status: `IN_PROGRESS`
- Related Docs: `/client`, `/docs/plans/2026-05-18-service-design-refresh-design.md`

**Step 2: Defer completion log**

Do not append the final work log until implementation and verification are complete.

### Task 2: Refresh Global Visual Tokens

**Files:**
- Modify: `client/src/index.css`

**Step 1: Update tokens**

Keep the existing shadcn CSS variable contract, but adjust the palette to:

- Paper-like background
- Deep coffee foreground
- Emerald primary
- Amber accent
- Soft neutral borders

**Step 2: Add global background polish**

Use a subtle layered CSS background on `body`. Avoid decorative blobs and avoid one-note brown/orange dominance.

**Step 3: Verify CSS compiles**

Run: `npm run build` in `client`

Expected: TypeScript and Vite build complete successfully.

### Task 3: Redesign Landing Home

**Files:**
- Modify: `client/src/App.tsx`

**Step 1: Keep behavior intact**

Do not alter:

- `mode` values
- `setMode("visitor")`
- `setMode("reporter")`
- API helpers
- Report submission behavior

**Step 2: Replace landing JSX**

Create a mobile-first home with:

- Top brand area
- Short value message
- Compact status/value strip
- Two action panels
- Small preview row for the service promise

**Step 3: Verify**

Run: `npm run build` in `client`

Expected: Build succeeds.

### Task 4: Redesign Visitor and Reporter Shell

**Files:**
- Modify: `client/src/App.tsx`

**Step 1: Update app shell**

Update the non-landing screen to:

- Use a constrained max width
- Keep a clear back button
- Place search in a prominent top panel
- Use a responsive two-column layout on desktop

**Step 2: Improve cafe list**

Use real buttons with accessible selected states and compact address text.

**Step 3: Improve selected cafe panel**

Show cafe context, summary, status metrics, recent reports, and reporter form in polished sections.

**Step 4: Verify**

Run: `npm run build` in `client`

Expected: Build succeeds.

### Task 5: Complete Docs and Verification

**Files:**
- Modify: `docs/tasks/task-board.md`
- Modify: `docs/logs/2026-05.md`

**Step 1: Mark task done**

Update `T-025` to `DONE` after verification.

**Step 2: Append work log**

Add a 2026-05-18 entry with:

- User request summary
- Interpreted task
- Files changed
- Design decision
- Verification command
- Next suggested step

**Step 3: Final verification**

Run:

```bash
npm run build
```

from `client`.

Expected: Build succeeds.
