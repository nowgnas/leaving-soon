# Client

Release1 uses a Vite React TypeScript frontend with Tailwind CSS v4 and shadcn/ui-style local components.

## Responsibilities

- Show the landing page with two entry paths:
  - `카페 갈래요`
  - `곧 나가요`
- Search Naver local cafe places through the server API.
- Fall back to sample cafes when Naver server credentials are not configured.
- Render cafe summaries and active leaving-soon reports from the server API.
- Submit leaving-soon seat reports.
- Use shadcn/ui primitives from `src/components/ui` for frontend controls.

## Commands

```bash
npm run dev
npm run build
```

The Vite dev server proxies `/api` requests to `http://127.0.0.1:3000`.

## Search Setup

Cafe search uses `/server` to call Naver Local Search API. Configure Naver credentials in the server environment.

For release1 local testing, leaving the server credentials empty keeps the sample-cafe fallback enabled.
