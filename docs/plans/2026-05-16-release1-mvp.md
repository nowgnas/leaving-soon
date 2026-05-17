# Release1 MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a locally runnable MVP for "곧나가요" where cafe visitors can find Kakao cafe places and people leaving soon can submit seat reports.

**Architecture:** The client is a static web app in `/client` with a landing page that splits users into "카페 갈래요" and "곧 나가요" flows. The server in `/server` exposes JSON APIs, stores reports in memory for release1, and serves the static client for local testing. Cafe search uses the Kakao Maps JavaScript API services library in the browser with category code `CE7`; server APIs store and summarize reports keyed by Kakao place id.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js built-in HTTP server, Node.js built-in test runner, Kakao Maps JavaScript API.

---

### Task 1: Project Tracking And Release Plan

**Files:**
- Modify: `docs/tasks/task-board.md`
- Create: `docs/plans/2026-05-16-release1-mvp.md`

**Steps:**
1. Add release1 MVP as `T-005`.
2. Mark it `IN_PROGRESS`.
3. Record that client/server initialization tasks are covered by release1.

### Task 2: Server Domain Tests

**Files:**
- Create: `server/test/domain.test.js`
- Create: `server/src/domain.js`

**Steps:**
1. Write failing tests for report creation, validation, cafe summary generation, and filtering active reports.
2. Run `rtk node --test server/test/domain.test.js` and confirm failure because the implementation does not exist.
3. Implement the smallest domain module that passes.
4. Re-run the test command.

### Task 3: Server API

**Files:**
- Create: `server/src/app.js`
- Create: `server/src/server.js`
- Create: `server/package.json`
- Modify: `server/README.md`

**Steps:**
1. Add a Node HTTP app with `GET /api/health`, `GET /api/cafes/:id/reports`, and `POST /api/cafes/:id/reports`.
2. Validate JSON request bodies through the domain layer.
3. Return consistent JSON errors.
4. Serve `/client` static files for local release1 usage.

### Task 4: Client MVP

**Files:**
- Create: `client/index.html`
- Create: `client/styles.css`
- Create: `client/app.js`
- Modify: `client/README.md`

**Steps:**
1. Build a landing page with two primary entry buttons: cafe visitor and leaving reporter.
2. Load Kakao Maps SDK only when `window.KAKAO_MAP_APP_KEY` is configured.
3. Implement cafe search with Kakao Places keyword search filtered by `category_group_code: "CE7"`.
4. Provide sample fallback cafes when the Kakao key is not configured.
5. Implement visitor flow with cafe cards, report summaries, and recent reports.
6. Implement leaving flow with cafe selection and report form.

### Task 5: Project Documentation And Verification

**Files:**
- Modify: `docs/project/overview.md`
- Modify: `docs/project/architecture.md`
- Modify: `docs/project/conventions.md`
- Modify: `docs/project/decisions.md`
- Modify: `docs/tasks/task-board.md`
- Modify: `docs/logs/2026-05.md`

**Steps:**
1. Update project overview and architecture for release1.
2. Record the Kakao Maps and no-build Node decision.
3. Mark release1 task done only after verification.
4. Run `rtk node --test server/test/domain.test.js`.
5. Run `rtk node server/src/server.js` briefly enough to confirm startup, then stop it.
