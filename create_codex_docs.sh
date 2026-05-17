#!/usr/bin/env bash
set -euo pipefail

mkdir -p client server docs/project docs/tasks docs/logs docs/reviews

cat > AGENTS.md <<'EOF'
# AGENTS.md

## Project Scope

This repository is a full-stack project managed with Codex.

The project must be organized with the following top-level structure:

- `/client`: frontend application
- `/server`: backend application
- `/docs`: project documentation, task tracking, decisions, and work logs

Do not create unrelated top-level folders unless the task clearly requires it.
If a new top-level folder is necessary, explain the reason before creating it.

---

## Working Principles

Codex must follow these principles for every task.

1. Understand the current project context before making changes.
2. Check existing files, conventions, and documentation before adding new structures.
3. Prefer small, incremental, high-confidence changes.
4. Keep `/client` and `/server` responsibilities clearly separated.
5. Update documentation after each task.
6. Track work as task units.
7. Summarize what changed at the end of every response.

---

## Ambiguous Request Handling

If the user's request is unclear, Codex must not immediately guess and implement a large change.

Instead, Codex should redefine the request into a concrete task plan and proceed with the safest reasonable interpretation.

When the request is ambiguous, Codex must respond using this structure:

1. Interpreted request
   - Restate what the user likely wants.

2. Assumptions
   - List assumptions made to proceed.

3. Task breakdown
   - Break the request into small implementation tasks.

4. Execution
   - Start with the lowest-risk task first.

If the ambiguity could cause destructive changes, data loss, security issues, or large architectural changes, Codex must ask for clarification before modifying files.

---

## Documentation Rules

The `/docs` directory is required.

Codex must maintain the following documentation structure:

```text
/docs
├── project/
│   ├── overview.md
│   ├── architecture.md
│   ├── conventions.md
│   └── decisions.md
├── tasks/
│   ├── task-board.md
│   └── task-template.md
├── logs/
│   └── YYYY-MM.md
└── reviews/
    └── code-review.md
```

### `/docs/project/overview.md`

This document describes the overall project direction.

It should include:

- Project goal
- Target users
- Core problem
- Main features
- Non-goals
- Current project status

### `/docs/project/architecture.md`

This document describes the technical architecture.

It should include:

- `/client` architecture
- `/server` architecture
- API communication flow
- Authentication/authorization flow, if applicable
- Data flow
- External integrations
- Important technical constraints

### `/docs/project/conventions.md`

This document describes coding and project conventions.

It should include:

- Naming rules
- Folder conventions
- API conventions
- Error handling conventions
- Testing conventions
- Commit/message conventions, if applicable

### `/docs/project/decisions.md`

This document records architectural and product decisions.

Each decision should include:

- Date
- Context
- Decision
- Reason
- Alternatives considered
- Impact

### `/docs/tasks/task-board.md`

This document tracks project tasks.

Codex must update this document whenever a task is started, changed, completed, or blocked.

### `/docs/logs/YYYY-MM.md`

Codex must append a work summary after every user request.

Each log entry should include:

- Date/time
- User request summary
- Interpreted task
- Files changed
- Decisions made
- Task status
- Next suggested step

---

## Task Management Rules

The project must be managed in task units.

Every task should have one of the following statuses:

- `TODO`
- `IN_PROGRESS`
- `DONE`
- `BLOCKED`
- `DEFERRED`

Every task should have a priority:

- `P0`: urgent or blocking
- `P1`: important
- `P2`: normal
- `P3`: optional

Every task should have a type:

- `feature`
- `bugfix`
- `refactor`
- `docs`
- `test`
- `infra`
- `chore`

Before implementing a request, Codex must:

1. Check `/docs/tasks/task-board.md`.
2. Identify whether the request maps to an existing task.
3. If not, create a new task.
4. Mark the active task as `IN_PROGRESS`.
5. After implementation, update the status.
6. Append a work log under `/docs/logs/YYYY-MM.md`.

---

## Required Response Format

At the end of every response, Codex must include:

```text
Summary:
- What was done
- Files changed
- Task status
- Next step
```

If no files were changed, say so explicitly.

---

## Implementation Boundaries

Codex must not:

- Mix frontend code into `/server`
- Mix backend code into `/client`
- Create large architecture changes without documenting the decision
- Delete existing code without explaining why
- Skip documentation updates after implementation
- Mark a task as `DONE` if tests or verification were not performed

---

## Verification Rules

After code changes, Codex should run the smallest relevant verification command.

Examples:

- Frontend: lint, typecheck, test, or build
- Backend: unit test, integration test, compile, or application context test
- Docs-only change: no runtime verification required

If verification cannot be run, Codex must explain why.

---

## Code Review Rules

When reviewing code, Codex must refer to:

- `/docs/reviews/code-review.md`

Review should focus on:

- Correctness
- Maintainability
- Security
- Performance
- Test coverage
- Error handling
- API compatibility
- Frontend/backend responsibility separation
EOF

cat > client/README.md <<'EOF'
# Client

Frontend application code belongs here.

Do not place backend business logic in this directory.
EOF

cat > server/README.md <<'EOF'
# Server

Backend application code belongs here.

Do not place frontend rendering logic in this directory.
EOF

cat > docs/project/overview.md <<'EOF'
# Project Overview

## Goal

Describe the main goal of this project.

## Target Users

Describe who will use this service.

## Problem

Describe the problem this project solves.

## Core Features

- Feature 1
- Feature 2
- Feature 3

## Non-goals

The project will not focus on:

- Non-goal 1
- Non-goal 2

## Current Status

Initial planning phase.

## Project Structure

```text
/client - frontend application
/server - backend application
/docs   - project documentation, task board, logs, and decisions
```
EOF

cat > docs/project/architecture.md <<'EOF'
# Architecture

## High-level Structure

```text
client  ->  server  ->  database / external services
```

## Client

The `/client` directory contains the frontend application.

Responsibilities:

- UI rendering
- User interaction
- API request handling
- Client-side state management

The client must not contain backend business logic.

## Server

The `/server` directory contains the backend application.

Responsibilities:

- API endpoints
- Business logic
- Persistence
- Authentication/authorization
- External service integration
- Server-side validation

The server must not contain frontend rendering logic.

## API Flow

1. Client sends request to server.
2. Server validates request.
3. Server executes business logic.
4. Server returns response.
5. Client renders result.

## Documentation Policy

Any architecture-level change must be recorded in `/docs/project/decisions.md`.
EOF

cat > docs/project/conventions.md <<'EOF'
# Project Conventions

## Folder Conventions

```text
/client - frontend application
/server - backend application
/docs   - documentation, task tracking, decisions, and logs
```

Do not create unrelated top-level folders unless the task clearly requires it.

## Naming Conventions

- Use clear and descriptive names.
- Avoid abbreviations unless they are already common in the project.
- Keep frontend and backend naming conventions consistent within each area.

## API Conventions

- API contracts should be documented when added or changed.
- Request and response structures should be explicit.
- Error responses should be consistent.

## Error Handling Conventions

- Handle expected errors explicitly.
- Avoid swallowing exceptions.
- Provide meaningful error messages.
- Backend errors should not expose sensitive implementation details.

## Testing Conventions

- Add or update tests when changing business behavior.
- Run the smallest relevant verification command after changes.
- If verification cannot be run, document the reason.

## Documentation Conventions

After every task:

1. Update `/docs/tasks/task-board.md`.
2. Append a work log to `/docs/logs/YYYY-MM.md`.
3. Record architectural decisions in `/docs/project/decisions.md` when needed.
EOF

cat > docs/project/decisions.md <<'EOF'
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
EOF

cat > docs/tasks/task-board.md <<'EOF'
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
| T-002 | Define actual project goal and core features | docs | P1 | TODO | User/Codex | `/docs/project/overview.md` | Fill in service-specific project direction |
| T-003 | Initialize client framework | chore | P2 | TODO | Codex | `/client` | Choose and initialize frontend stack |
| T-004 | Initialize server framework | chore | P2 | TODO | Codex | `/server` | Choose and initialize backend stack |
EOF

cat > docs/tasks/task-template.md <<'EOF'
# Task Template

## Task ID

T-000

## Title

Short task title

## Type

feature | bugfix | refactor | docs | test | infra | chore

## Priority

P0 | P1 | P2 | P3

## Status

TODO | IN_PROGRESS | DONE | BLOCKED | DEFERRED

## Background

Why this task is needed.

## Goal

What this task should accomplish.

## Scope

### Included

- Item 1
- Item 2

### Excluded

- Item 1
- Item 2

## Implementation Plan

1. Step 1
2. Step 2
3. Step 3

## Verification

- [ ] Build
- [ ] Test
- [ ] Manual check
- [ ] Documentation updated

## Result

What changed after completion.

## Related Files

- `/client/...`
- `/server/...`
- `/docs/...`
EOF

cat > docs/logs/2026-05.md <<'EOF'
# Work Log - 2026-05

## 2026-05-16

### Request Summary

User asked to create project-specific Codex documentation and workflow files for the currently opened Cursor project directory.

### Interpreted Task

Create a reusable project documentation structure that guides Codex to manage the project with `/client`, `/server`, and `/docs`, while tracking tasks and appending work logs after every request.

### Task

- Task ID: T-001
- Status: DONE

### Files Changed

- `AGENTS.md`
- `/client/README.md`
- `/server/README.md`
- `/docs/project/overview.md`
- `/docs/project/architecture.md`
- `/docs/project/conventions.md`
- `/docs/project/decisions.md`
- `/docs/tasks/task-board.md`
- `/docs/tasks/task-template.md`
- `/docs/logs/2026-05.md`
- `/docs/reviews/code-review.md`

### Decisions Made

- Use root `AGENTS.md` for project-specific Codex behavior.
- Use `/docs/tasks/task-board.md` for task tracking.
- Use `/docs/logs/YYYY-MM.md` for request-by-request work summaries.
- Keep `/client` and `/server` as strict top-level application boundaries.
- Keep framework initialization as a separate task.

### Verification

Docs-only change. Runtime verification is not required.

### Next Step

Fill `/docs/project/overview.md` with the actual service idea, target users, core features, and non-goals.
EOF

cat > docs/reviews/code-review.md <<'EOF'
# Code Review Guide

Codex must use this guide when reviewing or modifying code.

## Review Priorities

1. Correctness
2. Security
3. Maintainability
4. Testability
5. Performance
6. Consistency with project conventions

## General Checklist

- [ ] Does the code solve the stated task?
- [ ] Is the change minimal and focused?
- [ ] Are edge cases handled?
- [ ] Are errors handled explicitly?
- [ ] Is naming clear?
- [ ] Are responsibilities placed in the correct layer?
- [ ] Are tests added or updated when needed?
- [ ] Is documentation updated?

## Frontend Checklist

- [ ] UI state is clear and predictable.
- [ ] API calls are isolated from presentation logic where possible.
- [ ] Components are not overly coupled.
- [ ] Loading, empty, and error states are handled.

## Backend Checklist

- [ ] Input validation is handled.
- [ ] Business logic is not placed directly in controllers.
- [ ] Error responses are consistent.
- [ ] Persistence logic is separated from business logic.
- [ ] External integrations have timeout/error handling where needed.
- [ ] Tests cover important business behavior.

## Documentation Checklist

- [ ] Task board updated.
- [ ] Work log updated.
- [ ] Architecture decisions recorded when needed.
EOF

echo "Codex project docs created."
