-- ====================================================================
-- BẮTKÈO7.VN — DATABASE ARCHITECTURE & STORED PROCEDURES (PHA 2)
-- PostgreSQL / Supabase Schema Definition
-- Khu vực thử nghiệm: Quận Cầu Giấy & Quận Nam Từ Liêm, Hà Nội
-- ====================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE skill_tier_enum AS ENUM ('1', '2', '3');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE match_status_enum AS ENUM ('OPEN', 'MATCHED', 'PLAYING', 'COMPLETED', 'CANCELLED', 'DISPUTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE warning_badge_enum AS ENUM ('TUNG_BUNG_KEO', 'DANG_BI_KHOA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- 2. CÁC BẢNG DỮ LIỆU CỐT LÕI (CORE TABLES)
-- ====================================================================

-- 2.1 Bảng Hồ sơ Đội bóng (Teams)
CREATE TABLE IF NOT EXISTS public.teams (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  short_name VARCHAR(40) NOT NULL,
  captain_name VARCHAR(80) NOT NULL,
  captain_phone VARCHAR(20) NOT NULL,
  captain_zalo VARCHAR(20),
  district VARCHAR(40) NOT NULL CHECK (district IN ('Cầu Giấy', 'Nam Từ Liêm')),
  home_pitch VARCHAR(120),
  skill_tier INT NOT NULL CHECK (skill_tier IN (1, 2, 3)),
  avg_age NUMERIC(4, 1) DEFAULT 26.0,
  jersey_color VARCHAR(30) DEFAULT '#16a34a',
  
  -- Điểm tín nhiệm & Chế tài v2.0
  credit_score INT NOT NULL DEFAULT 100 CHECK (credit_score BETWEEN 0 AND 100),
  warning_badge warning_badge_enum DEFAULT NULL,
  consecutive_clean_matches INT NOT NULL DEFAULT 0,
  penalties_count INT NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  lock_until TIMESTAMPTZ DEFAULT NULL,
  
  -- Đánh giá mù (Sao)
  rating_punctual NUMERIC(3, 2) DEFAULT 5.0,
  rating_fairplay NUMERIC(3, 2) DEFAULT 5.0,
  rating_financial NUMERIC(3, 2) DEFAULT 5.0,
  total_matches_played INT NOT NULL DEFAULT 0,

  -- Thông tin thanh toán VietQR
  bank_bin VARCHAR(10) DEFAULT '970422', -- MBBank
  bank_name VARCHAR(50) DEFAULT 'MBBank',
  account_number VARCHAR(30) DEFAULT '07440948327598',
  account_owner VARCHAR(80) DEFAULT 'TRAN QUOC THIEN PHUOC',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 Bảng Cụm Sân Cỏ Nhân Tạo (Pitches)
CREATE TABLE IF NOT EXISTS public.pitches (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  short_name VARCHAR(60) NOT NULL,
  district VARCHAR(40) NOT NULL CHECK (district IN ('Cầu Giấy', 'Nam Từ Liêm')),
  address TEXT NOT NULL,
  total_fields_7 INT NOT NULL DEFAULT 6,
  surface_quality VARCHAR(80) DEFAULT 'Cỏ nhân tạo sợi đúc mới',
  has_lighting BOOLEAN NOT NULL DEFAULT TRUE,
  has_parking BOOLEAN NOT NULL DEFAULT TRUE,
  peak_price_vnd INT NOT NULL DEFAULT 850000,
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 Bảng Kèo Đấu Sân 7 (Matches)
CREATE TABLE IF NOT EXISTS public.matches (
  id VARCHAR(64) PRIMARY KEY,
  host_team_id VARCHAR(64) NOT NULL REFERENCES public.teams(id),
  guest_team_id VARCHAR(64) REFERENCES public.teams(id),
  pitch_id VARCHAR(64) NOT NULL REFERENCES public.pitches(id),
  pitch_field_number VARCHAR(20) DEFAULT 'Sân 1',
  
  district VARCHAR(40) NOT NULL,
  match_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  total_cost_vnd INT NOT NULL DEFAULT 850000,
  share_cost_vnd INT NOT NULL DEFAULT 425000,
  required_tier INT NOT NULL CHECK (required_tier IN (1, 2, 3)),
  
  status match_status_enum NOT NULL DEFAULT 'OPEN',
  is_sos BOOLEAN NOT NULL DEFAULT FALSE,
  sos_subsidy_vnd INT DEFAULT 125000,
  sos_expires_at TIMESTAMPTZ DEFAULT NULL,
  cancellation_reason TEXT DEFAULT NULL,
  
  notes TEXT,
  escrow_required BOOLEAN NOT NULL DEFAULT FALSE,
  escrow_deposit_vnd INT DEFAULT 0,
  
  matched_at TIMESTAMPTZ DEFAULT NULL,
  version INT NOT NULL DEFAULT 1, -- Optimistic concurrency & audit tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_status_district ON public.matches(status, district);
CREATE INDEX IF NOT EXISTS idx_matches_date_time ON public.matches(match_date, start_time);

-- 2.4 Bảng Chợ Cầu 2 Chiều: Cầu Thủ Tự Do Tìm Đội (Free Agent Posts)
CREATE TABLE IF NOT EXISTS public.free_agent_posts (
  id VARCHAR(64) PRIMARY KEY,
  player_name VARCHAR(100) NOT NULL,
  age INT DEFAULT 25,
  preferred_foot VARCHAR(30) DEFAULT 'Chân phải',
  position VARCHAR(20) NOT NULL DEFAULT 'MF', -- GK, DF, MF, FW
  position_label VARCHAR(60) NOT NULL DEFAULT 'Tiền Vệ (MF)',
  skill_tier INT DEFAULT 2 CHECK (skill_tier IN (1, 2, 3)),
  districts TEXT[] DEFAULT ARRAY['Cầu Giấy'],
  available_date VARCHAR(60),
  available_date_iso DATE DEFAULT CURRENT_DATE,
  available_time_slots TEXT[] DEFAULT ARRAY['19:00 - 20:30'],
  phone VARCHAR(20) NOT NULL,
  zalo_phone VARCHAR(20),
  bio TEXT,
  fut_stats JSONB DEFAULT '{"ovr": 85, "pac": 85, "tec": 85, "pas": 85, "def": 85, "fpl": 98}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4b Bảng Chợ Cầu 2 Chiều: Đội Tuyển Thêm Người (Sub Player Posts)
CREATE TABLE IF NOT EXISTS public.sub_player_posts (
  id VARCHAR(64) PRIMARY KEY,
  team_id VARCHAR(64),
  team_name VARCHAR(120) NOT NULL,
  position_needed VARCHAR(60) NOT NULL, -- Thủ Môn (GK), Trung Vệ (CB), Tiền Vệ (MF), Tiền Đạo (FW)
  position_code VARCHAR(20) DEFAULT 'MF',
  quantity INT NOT NULL DEFAULT 1,
  match_date VARCHAR(60),
  match_date_iso DATE DEFAULT CURRENT_DATE,
  match_time VARCHAR(80) NOT NULL,
  expires_at TIMESTAMPTZ,
  pitch_name VARCHAR(120) NOT NULL,
  district VARCHAR(40) NOT NULL,
  skill_tier INT DEFAULT 2 CHECK (skill_tier IN (1, 2, 3)),
  contact_phone VARCHAR(20) NOT NULL,
  contact_zalo VARCHAR(20),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_free_agents_pos_date ON public.free_agent_posts(position, available_date_iso);
CREATE INDEX IF NOT EXISTS idx_sub_posts_district_time ON public.sub_player_posts(district, match_date_iso);

-- 2.5 Bảng Điểm Danh Quân Số (Roll Call)
CREATE TABLE IF NOT EXISTS public.roll_call_sessions (
  id VARCHAR(64) PRIMARY KEY,
  match_id VARCHAR(64) NOT NULL REFERENCES public.matches(id),
  team_id VARCHAR(64) NOT NULL REFERENCES public.teams(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roll_call_members (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL REFERENCES public.roll_call_sessions(id) ON DELETE CASCADE,
  player_name VARCHAR(80) NOT NULL,
  jersey_number INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'JOIN', -- JOIN, BUSY, PENDING
  has_paid BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 Bảng Đánh Giá Mù Hai Chiều (Blind Reviews)
CREATE TABLE IF NOT EXISTS public.blind_reviews (
  id VARCHAR(64) PRIMARY KEY,
  match_id VARCHAR(64) NOT NULL REFERENCES public.matches(id),
  reviewer_team_id VARCHAR(64) NOT NULL REFERENCES public.teams(id),
  target_team_id VARCHAR(64) NOT NULL REFERENCES public.teams(id),
  
  rating_punctual INT NOT NULL CHECK (rating_punctual BETWEEN 1 AND 5),
  rating_fairplay INT NOT NULL CHECK (rating_fairplay BETWEEN 1 AND 5),
  rating_financial INT NOT NULL CHECK (rating_financial BETWEEN 1 AND 5),
  voted_tier INT NOT NULL CHECK (voted_tier IN (1, 2, 3)),
  comment TEXT,
  
  is_revealed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 Bảng Lịch Sử Biến Động Tín Nhiệm & Phạt (Penalty Audit Logs)
CREATE TABLE IF NOT EXISTS public.penalty_audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  team_id VARCHAR(64) NOT NULL REFERENCES public.teams(id),
  match_id VARCHAR(64) REFERENCES public.matches(id),
  points_change INT NOT NULL,
  score_before INT NOT NULL,
  score_after INT NOT NULL,
  violation_type VARCHAR(60) NOT NULL, -- CANCEL_EARLY, CANCEL_WARNED, CANCEL_NOSHOW, FIVE_STAR_BONUS, APPEAL_RESTORE
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 3. STORED PROCEDURE: KHÓA KÈO CHỐNG RACE CONDITION (ROW-LEVEL LOCK)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.fn_lock_match_challenge(
  p_match_id VARCHAR(64),
  p_guest_team_id VARCHAR(64),
  p_challenger_phone VARCHAR(20)
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_match public.matches%ROWTYPE;
  v_guest public.teams%ROWTYPE;
  v_requires_escrow BOOLEAN := FALSE;
  v_result JSONB;
BEGIN
  -- 1. Khóa hàng ghi tạm thời bằng SELECT FOR UPDATE (Chặn xung đột đồng thời)
  SELECT * INTO v_match
  FROM public.matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND', 'message', 'Không tìm thấy mã trận đấu.');
  END IF;

  -- 2. Kiểm tra nếu kèo đã bị đối khác bắt
  IF v_match.status != 'OPEN' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ALREADY_MATCHED',
      'message', 'Kèo đấu này vừa được đội khác nhận trước trong tích tắc!'
    );
  END IF;

  -- 3. Kiểm tra thông tin đội nhận kèo
  SELECT * INTO v_guest
  FROM public.teams
  WHERE id = p_guest_team_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'GUEST_NOT_FOUND', 'message', 'Thông tin đội bóng thách đấu không hợp lệ.');
  END IF;

  -- 4. Kiểm tra tài khoản có bị khóa không
  IF v_guest.is_locked = TRUE THEN
    RETURN jsonb_build_object('success', false, 'code', 'TEAM_LOCKED', 'message', 'Tài khoản đội đang bị tạm khóa 14 ngày do vi phạm bùng kèo liên tiếp.');
  END IF;

  -- 5. Quy chế Tín Nhiệm v2.0: Điểm < 70đ hoặc gắn nhãn đỏ bắt buộc ký quỹ 100%
  IF v_guest.credit_score < 70 OR v_guest.warning_badge = 'TUNG_BUNG_KEO' THEN
    v_requires_escrow := TRUE;
  END IF;

  -- 6. Cập nhật trạng thái trận đấu (Khóa giao dịch thành công)
  UPDATE public.matches
  SET
    guest_team_id = p_guest_team_id,
    status = 'MATCHED',
    is_sos = FALSE,
    escrow_required = v_requires_escrow,
    escrow_deposit_vnd = CASE WHEN v_requires_escrow THEN 200000 ELSE 0 END,
    matched_at = NOW(),
    version = version + 1,
    updated_at = NOW()
  WHERE id = p_match_id;

  -- 7. Trả về kết quả JSON cho Client & Trigger Webhook Telegram
  v_result := jsonb_build_object(
    'success', true,
    'code', 'LOCKED_SUCCESSFULLY',
    'match_id', p_match_id,
    'host_team_id', v_match.host_team_id,
    'guest_team_id', p_guest_team_id,
    'escrow_required', v_requires_escrow,
    'matched_at', NOW()
  );

  RETURN v_result;
END;
$$;

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_player_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roll_call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roll_call_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blind_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penalty_audit_logs ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai danh mục sân và bảng tin kèo đấu
CREATE POLICY "Public read pitches" ON public.pitches FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public read sub posts" ON public.sub_player_posts FOR SELECT USING (true);
CREATE POLICY "Public read roll call" ON public.roll_call_members FOR SELECT USING (true);

-- Đánh giá mù: Chỉ hiển thị chi tiết khi is_revealed = true hoặc là chính đội đánh giá
CREATE POLICY "Blind review privacy" ON public.blind_reviews
  FOR SELECT USING (is_revealed = true OR auth.uid()::text = reviewer_team_id);

-- Cho phép chèn bản ghi kèo và chợ cầu
CREATE POLICY "Insert matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert sub posts" ON public.sub_player_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert reviews" ON public.blind_reviews FOR INSERT WITH CHECK (true);

-- ====================================================================
-- 5. SEED DATA MẪU: CỤM SÂN CẦU GIẤY & NAM TỪ LIÊM + ĐỘI BÓNG
-- ====================================================================

INSERT INTO public.pitches (id, name, short_name, district, address, total_fields_7, peak_price_vnd, lat, lng)
VALUES
  ('pitch-cg-01', 'Sân Bóng Đá Trung Kính Hạ', 'Trung Kính Hạ', 'Cầu Giấy', 'Ngõ 29 Mạc Thái Tổ, Yên Hòa, Cầu Giấy', 6, 850000, 21.0185, 105.7915),
  ('pitch-cg-02', 'Sân Bóng Đá Thành Phát', 'Thành Phát', 'Cầu Giấy', 'Số 2 Hoàng Minh Giám, Trung Hòa, Cầu Giấy', 8, 900000, 21.0068, 105.7989),
  ('pitch-cg-03', 'Sân Bóng Đá D30 Bộ Công An', 'D30 Tôn Thất Thuyết', 'Cầu Giấy', 'Số 1 Tôn Thất Thuyết, Dịch Vọng Hậu, Cầu Giấy', 4, 800000, 21.0289, 105.7834),
  ('pitch-cg-04', 'Sân Bóng Đá ĐH Thương Mại', 'ĐH Thương Mại', 'Cầu Giấy', 'Số 79 Hồ Tùng Mậu, Mai Dịch, Cầu Giấy', 5, 800000, 21.0365, 105.7745),
  ('pitch-ntl-01', 'Sân Bóng Đá Mễ Trì Hạ', 'Mễ Trì Hạ', 'Nam Từ Liêm', 'Đường Mễ Trì Hạ (gần The Garden), Nam Từ Liêm', 7, 800000, 21.0135, 105.7785),
  ('pitch-ntl-02', 'Sân Bóng Đá PVV Trần Hữu Dực', 'PVV Trần Hữu Dực', 'Nam Từ Liêm', 'Đường Trần Hữu Dực, Mỹ Đình 2, Nam Từ Liêm', 6, 850000, 21.0331, 105.7592),
  ('pitch-ntl-03', 'Sân Bóng Đá Mỹ Đình Pearl Sports', 'Mỹ Đình Pearl', 'Nam Từ Liêm', 'Số 1 Châu Văn Liêm, Phú Đô, Nam Từ Liêm', 8, 950000, 21.0055, 105.7728),
  ('pitch-ntl-04', 'Sân Bóng Đá Đình Thôn', 'Đình Thôn Arena', 'Nam Từ Liêm', 'Ngõ 54 Đình Thôn, Mỹ Đình 1, Nam Từ Liêm', 5, 750000, 21.0205, 105.7740)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.teams (id, name, short_name, captain_name, captain_phone, district, skill_tier, credit_score, warning_badge, bank_bin, account_number, account_owner)
VALUES
  ('team-cg-01', 'FC Anh Em Cầu Giấy', 'Anh Em CG', 'Thiên Phước', '0988.765.432', 'Cầu Giấy', 2, 100, NULL, '970422', '07440948327598', 'TRAN QUOC THIEN PHUOC'),
  ('team-cg-02', 'FC Dưỡng Sinh Duy Tân', 'Duy Tân FC', 'Anh Tuấn', '0982.345.678', 'Cầu Giấy', 1, 100, NULL, '970422', '098234567899', 'NGUYEN ANH TUAN'),
  ('team-cg-03', 'FC Sinh Viên Giao Thông', 'UTC FC', 'Quang Hùng', '0912.888.999', 'Cầu Giấy', 2, 95, NULL, '970436', '1028392819', 'HOANG QUANG HUNG'),
  ('team-ntl-01', 'FC Phủi 36 Mễ Trì', 'Phủi 36', 'Thành Đạt', '0977.111.222', 'Nam Từ Liêm', 3, 100, NULL, '970415', '10982736451', 'TRAN THANH DAT'),
  ('team-cg-warn', 'FC Cựu Binh Cầu Giấy', 'Cựu Binh CG', 'Đức Thắng', '0904.555.666', 'Cầu Giấy', 2, 35, 'TUNG_BUNG_KEO', '970422', '0904555666', 'TRAN DUC THANG')
ON CONFLICT (id) DO NOTHING;

