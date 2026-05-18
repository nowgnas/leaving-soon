-- seat_reports 테이블 생성
CREATE TABLE seat_reports (
  id                  TEXT PRIMARY KEY,
  cafe_id             TEXT NOT NULL,
  cafe_name           TEXT NOT NULL,
  leaving_in_minutes  INTEGER NOT NULL,
  seat_count          INTEGER NOT NULL,
  has_outlet          BOOLEAN NOT NULL DEFAULT false,
  seat_space          TEXT NOT NULL,
  crowd_level         TEXT NOT NULL,
  has_waiting         BOOLEAN NOT NULL DEFAULT false,
  note                TEXT DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at          TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_seat_reports_cafe_id ON seat_reports (cafe_id);
CREATE INDEX idx_seat_reports_expires_at ON seat_reports (expires_at);

-- RLS 비활성화 (service_role_key로만 접근하므로)
ALTER TABLE seat_reports ENABLE ROW LEVEL SECURITY;

-- cleanup cron (매시 정각 만료 24시간 지난 데이터 삭제)
-- Supabase 대시보드 > SQL Editor에서 실행
-- 주의: net extension과 cron extension이 활성화되어 있어야 합니다
--
-- SELECT cron.schedule(
--   'cleanup-expired-reports',
--   '0 * * * *',
--   $$DELETE FROM seat_reports WHERE expires_at < now() - interval '24 hours'$$
-- );
