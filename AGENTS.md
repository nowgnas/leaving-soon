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
