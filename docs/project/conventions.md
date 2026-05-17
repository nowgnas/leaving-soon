# Project Conventions

## Folder Conventions

```text
/client - frontend application
/server - backend application
/docs   - documentation, task tracking, decisions, and logs
```

Do not create unrelated top-level folders unless the task clearly requires it.

Client source code belongs under `/client/src`.
Server source code belongs under `/server/src`.
Server tests belong under `/server/test`.

## Naming Conventions

- Use clear and descriptive names.
- Avoid abbreviations unless they are already common in the project.
- Keep frontend and backend naming conventions consistent within each area.
- Use TypeScript for client and server application code.
- Use shadcn/ui-style component names and structure under `/client/src/components/ui`.

## API Conventions

- API contracts should be documented when added or changed.
- Request and response structures should be explicit.
- Error responses should be consistent.
- Release1 APIs return JSON.
- Error responses use `{ "error": { "code": "...", "message": "..." } }`.
- Cafe-specific server endpoints use external platform place ids as `:id` values when available.
- AI summaries must include `source: "ai" | "rule"` so clients and logs can distinguish Gemini output from fallback output.
- External AI keys must stay on the server and must not be exposed to `/client`.

## Error Handling Conventions

- Handle expected errors explicitly.
- Avoid swallowing exceptions.
- Provide meaningful error messages.
- Backend errors should not expose sensitive implementation details.

## Testing Conventions

- Add or update tests when changing business behavior.
- Run the smallest relevant verification command after changes.
- If verification cannot be run, document the reason.
- Release1 server tests use Vitest.
- Domain behavior tests live under `/server/test`.
- Run `npm run build` in both `/client` and `/server` before marking stack changes done.

## Documentation Conventions

After every task:

1. Update `/docs/tasks/task-board.md`.
2. Append a work log to `/docs/logs/YYYY-MM.md`.
3. Record architectural decisions in `/docs/project/decisions.md` when needed.
