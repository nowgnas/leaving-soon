추천 배포안

- client: Cloudflare Pages
- server: Render Free Web Service
- db: Supabase Free Postgres
- cleanup: Supabase Cron 또는 cron이 POST /api/internal/cleanup/reports를 호출

이 조합을 추천하는 이유는:

- 지금 Vite + React 클라이언트는 정적 빌드라 Pages에 잘 맞습니다.
- 지금 Fastify 서버는 Render에 거의 그대로 올릴 수 있습니다.
- 보고서 데이터는 Supabase에 저장해서 서버 재시작에도 유지됩니다.
- 오래된 데이터 정리는 Supabase Cron으로 DB 안에서 돌리면 가장 단순합니다.

공식 문서 기준으로 보면:

- Cloudflare Pages의 static asset 요청은 무료/무제한입니다. Pages Functions만 Workers 쿼터를 씁니다.
  https://developers.cloudflare.com/pages/functions/pricing/
- Render Free web service는 월 750 instance hours가 있고, spun-down 서비스는 시간을 소모하지 않습니다.
  https://render.com/docs/free
- Supabase Free는 500MB DB, 2 active projects 같은 제한이 있습니다.
  https://supabase.com/pricing
- Supabase Cron은 Postgres 기반 스케줄링이라 유지보수 작업에 맞습니다.
  https://supabase.com/docs/guides/cron

배포 전에 필요한 것

1. Supabase에 seat_reports 테이블 생성
   - id, cafe_id, cafe_name, leaving_in_minutes, seat_count, has_outlet, seat_space, crowd_level, has_waiting, note, created_at, expires_at
   - cafe_id, expires_at 인덱스 권장
2. 서버 배포 환경변수 세팅
   - NAVER_CLIENT_ID
   - NAVER_CLIENT_SECRET
   - GEMINI_API_KEY
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - CLEANUP_SECRET
3. 클라이언트 배포용 API 주소 연결
   - 현재 클라이언트는 상대 경로 /api/...를 씁니다.
   - 배포에서는 VITE_API_BASE_URL 같은 설정이 필요합니다.
   - 이건 배포 직전 한 번 넣어야 합니다. 지금 구조 그대로는 프론트와 서버가 다른 도메인일 때 호출이 끊깁니다.
4. cleanup 실행 방식 결정
   - 추천: Supabase Cron이 cleanup endpoint를 호출
   - 대안: GitHub Actions scheduled workflow가 cleanup endpoint 호출
   - 둘 다 비용은 거의 없고, Supabase Cron이 더 단순합니다.

운영 기준

- active 제보 = expires_at > now()
- 오래된 데이터 삭제 = expires_at < now() - interval '24 hours'
- 즉, 요약/조회에는 active만 쓰고, 만료 후 24시간 지나면 삭제합니다.

권장 실행 순서

1. Supabase 테이블 만들기
2. Render에 서버 배포
3. Cloudflare Pages에 클라이언트 배포
4. 클라이언트에 production API base URL 연결
5. Supabase Cron 또는 scheduled workflow로 cleanup 연결
6. 방문자 조회/제보 등록/검색 smoke test

Cloudflare Pages + Render Free + Supabase Free로 먼저 가고, 트래픽이 붙거나 cold start가 거슬릴 때만 서버를 유료로 올리는 게 맞습니다. 지금 시점에서 더 비싼
구조로 시작할 이유는 없습니다.

Summary:

- What was done: 배포 방식과 플랫폼, 배포 전 필요한 준비사항을 정리하고 문서에 반영
- Files changed: docs/project/decisions.md, docs/tasks/task-board.md, docs/logs/2026-05.md
- Task status: T-023 DONE
- Next step: Supabase 테이블 스키마와 클라이언트의 production API base URL 연결만 정리하면 배포에 들어갈 수 있습니다
