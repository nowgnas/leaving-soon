# Release1 Stack Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild release1 with explicit production-ready development stacks and shadcn/ui for the frontend.

**Architecture:** `/client` becomes a Vite React TypeScript SPA using Tailwind CSS v4 and local shadcn/ui components. `/server` becomes a Fastify TypeScript API with Zod validation and in-memory report storage. The client calls the server API through a Vite dev proxy and keeps Kakao Maps JavaScript cafe search in the browser.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS v4, shadcn/ui, Fastify, Zod, Vitest, tsx.

---

### Task 1: Tracking And Decisions

**Files:**
- Modify: `docs/tasks/task-board.md`
- Modify: `docs/project/decisions.md`

**Steps:**
1. Add task `T-006`.
2. Mark it `IN_PROGRESS`.
3. Record the client and server stack decision.

### Task 2: Server Rebuild

**Files:**
- Create/Modify: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/domain.ts`
- Create: `server/src/app.ts`
- Create: `server/src/server.ts`
- Create: `server/src/types.ts`
- Create: `server/test/domain.test.ts`

**Steps:**
1. Port the release1 domain behavior to TypeScript.
2. Add Zod validation for report input.
3. Add Fastify routes for health, report list, and report create.
4. Add Vitest coverage for report validation and summaries.

### Task 3: Client Rebuild

**Files:**
- Create/Modify: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/tsconfig.app.json`
- Create: `client/tsconfig.node.json`
- Create: `client/vite.config.ts`
- Create: `client/components.json`
- Create: `client/src/*`

**Steps:**
1. Configure Vite React TypeScript with Tailwind CSS v4.
2. Add shadcn-compatible UI components under `src/components/ui`.
3. Rebuild the landing, visitor flow, reporter flow, and Kakao search in React.
4. Use only shadcn/ui primitives for buttons, cards, inputs, labels, selects, textarea, and badges.

### Task 4: Verification

**Commands:**
- `rtk npm install` in `/server`
- `rtk npm test` in `/server`
- `rtk npm run build` in `/server`
- `rtk npm install` in `/client`
- `rtk npm run build` in `/client`

### Task 5: Documentation

**Files:**
- Modify: `docs/project/overview.md`
- Modify: `docs/project/architecture.md`
- Modify: `docs/project/conventions.md`
- Modify: `docs/tasks/task-board.md`
- Modify: `docs/logs/2026-05.md`
