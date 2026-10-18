-- =============================================================================
-- BẮTKÈO7 HÀ NỘI - MIGRATION: CHỢ CẦU LẺ 2 CHIỀU & CẦU THỦ TỰ DO (SOLO MARKET)
-- Hỗ trợ:
--   1. Chế độ 1 (FREE_AGENT): Cầu thủ tự do đăng hồ sơ Scout Card tìm đội ghép trận
--   2. Chế độ 2 (TEAM_RECRUIT): Đội bóng thiếu 1-2 vị trí tuyển quân sát giờ
--   3. Stored Procedure fn_get_solo_market & fn_find_quick_matches_100
-- =============================================================================

-- 1. Tạo bảng lưu trữ tin Chợ Cầu 2 Chiều (nếu chưa tồn tại)
CREATE TABLE IF NOT EXISTS public.sub_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_mode TEXT NOT NULL DEFAULT 'FREE_AGENT' CHECK (post_mode IN ('FREE_AGENT', 'TEAM_RECRUIT')),
    creator_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Thông tin chung & vị trí
    position_code TEXT NOT NULL CHECK (position_code IN ('GK', 'DF', 'MF', 'FW')),
    position_label TEXT NOT NULL,
    skill_tier SMALLINT NOT NULL DEFAULT 2 CHECK (skill_tier IN (1, 2, 3)),
    district TEXT NOT NULL DEFAULT 'Cầu Giấy',
    time_slots TEXT[] NOT NULL DEFAULT ARRAY['19:00'],
    fee_contribution TEXT NOT NULL DEFAULT 'Sẵn sàng share 50k',
    contact_phone TEXT NOT NULL,
    contact_zalo TEXT,
    notes TEXT,

    -- Thông tin riêng cho Cầu thủ tự do (Scout Card)
    player_name TEXT,
    player_age SMALLINT DEFAULT 25,
    preferred_foot TEXT DEFAULT 'Chân phải',
    player_trust_score NUMERIC(3,2) DEFAULT 5.00,
    matches_joined INT DEFAULT 0,
    fut_ovr SMALLINT DEFAULT 85,
    fut_pac SMALLINT DEFAULT 85,
    fut_tec SMALLINT DEFAULT 85,
    fut_pas SMALLINT DEFAULT 85,
    fut_def SMALLINT DEFAULT 80,
    fut_fpl SMALLINT DEFAULT 95,
    has_first_timer_voucher BOOLEAN DEFAULT TRUE,

    -- Thông tin riêng cho Đội bóng tuyển người (Team Recruitment)
    team_id UUID,
    team_name TEXT,
    pitch_name TEXT,
    quantity SMALLINT DEFAULT 1,

    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FILLED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tạo Index tối ưu tốc độ truy vấn theo Chế độ, Vị trí, Quận và Tier
CREATE INDEX IF NOT EXISTS idx_sub_players_mode_status
    ON public.sub_players (post_mode, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sub_players_pos_district
    ON public.sub_players (position_code, district, skill_tier);

-- 3. Bật Row Level Security (RLS)
ALTER TABLE public.sub_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read active solo market" ON public.sub_players;
CREATE POLICY "Allow public read active solo market"
    ON public.sub_players
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert solo market" ON public.sub_players;
CREATE POLICY "Allow authenticated insert solo market"
    ON public.sub_players
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow creator update or delete own solo post" ON public.sub_players;
CREATE POLICY "Allow creator update or delete own solo post"
    ON public.sub_players
    FOR ALL
    USING (auth.uid() = creator_user_id);

-- 4. Stored Procedure: fn_get_solo_market
-- Truy vấn danh sách Cầu thủ tìm đội hoặc Đội tuyển người với bộ lọc đa chiều,
-- ưu tiên Thủ môn (GK Hotline) và Điểm Uy Tín Cá Nhân cao lên đầu.
CREATE OR REPLACE FUNCTION public.fn_get_solo_market(
    p_mode TEXT DEFAULT 'FREE_AGENT',
    p_position TEXT DEFAULT 'ALL',
    p_district TEXT DEFAULT 'ALL',
    p_tier SMALLINT DEFAULT NULL
)
RETURNS SETOF public.sub_players
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM public.sub_players
    WHERE status = 'ACTIVE'
      AND post_mode = p_mode
      AND (p_position = 'ALL' OR position_code = p_position)
      AND (p_district = 'ALL' OR district ILIKE '%' || p_district || '%')
      AND (p_tier IS NULL OR skill_tier = p_tier)
    ORDER BY
      -- Ưu tiên số 1: Thủ môn (Hàng hiếm sân 7)
      CASE WHEN position_code = 'GK' THEN 0 ELSE 1 END ASC,
      -- Ưu tiên số 2: Điểm uy tín cá nhân (Player Trust Score)
      player_trust_score DESC NULLS LAST,
      -- Ưu tiên số 3: Tin mới đăng
      created_at DESC;
$$;
