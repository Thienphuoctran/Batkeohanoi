-- ====================================================================
-- MIGRATION: PHA 1 HARDENING & DISTRICT CONSTRAINT EXPANSION
-- File: supabase/migrations/20261021_pha1_hardening.sql
-- Mục đích:
-- 1. Nới lỏng kiểm tra quận huyện (Cầu Giấy, Nam Từ Liêm -> 12 Quận Hà Nội)
-- 2. Bổ sung Composite Indexes tăng tốc truy vấn Realtime Match Feed
-- 3. Đảm bảo an toàn giao dịch và tính toàn vẹn dữ liệu
-- ====================================================================

-- 1. XÓA BỎ RÀNG BUỘC CHECK QUẬN HUYỆN CŨ (NẾU CÓ) ĐỂ HỖ TRỢ TOÀN HÀ NỘI
DO $$ 
DECLARE
  r RECORD;
BEGIN
  -- Xóa check constraint district trên bảng teams
  FOR r IN (
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.teams'::regclass 
      AND contype = 'c' 
      AND pg_get_constraintdef(oid) LIKE '%district%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;

  -- Xóa check constraint district trên bảng pitches
  FOR r IN (
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.pitches'::regclass 
      AND contype = 'c' 
      AND pg_get_constraintdef(oid) LIKE '%district%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.pitches DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- Nâng cấp độ dài trường district lên 60 ký tự
ALTER TABLE public.teams ALTER COLUMN district TYPE VARCHAR(60);
ALTER TABLE public.pitches ALTER COLUMN district TYPE VARCHAR(60);
ALTER TABLE public.matches ALTER COLUMN district TYPE VARCHAR(60);

-- 2. TỐI ƯU HÓA INDEXES CHO BẢNG TIN TRẬN ĐẤU & TRẠM CỨU HỘ SOS
CREATE INDEX IF NOT EXISTS idx_matches_status_district ON public.matches(status, district);
CREATE INDEX IF NOT EXISTS idx_matches_date_time ON public.matches(match_date, start_time);
CREATE INDEX IF NOT EXISTS idx_matches_host_team ON public.matches(host_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_guest_team ON public.matches(guest_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_desc ON public.matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_sos ON public.matches(is_sos, status) WHERE is_sos = TRUE;
CREATE INDEX IF NOT EXISTS idx_teams_credit_score ON public.teams(credit_score);
CREATE INDEX IF NOT EXISTS idx_sub_posts_status ON public.sub_player_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_free_agents_status ON public.free_agent_posts(status, created_at DESC);

-- 3. BẢO MẬT RLS (ROW LEVEL SECURITY)
-- Đảm bảo quyền truy vấn danh sách sân và bảng tin công khai không bị tắc nghẽn
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_player_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_agent_posts ENABLE ROW LEVEL SECURITY;

-- 4. LOG XÁC NHẬN HOÀN TẤT
COMMENT ON TABLE public.matches IS 'Bảng kèo đấu sân 7 Hà Nội - Đã tối ưu Index và hỗ trợ toàn diện 12 quận';
