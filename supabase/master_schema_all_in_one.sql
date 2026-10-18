-- ============================================================================
-- BẮT KÈO 7 (GIAOHUU.VN) — TOÀN BỘ CƠ SỞ DỮ LIỆU & LOGIC POSTGRESQL CHUẨN HOÁ
-- Tương thích: Supabase Dashboard / SQL Editor (Chạy 1 lần duy nhất, không lo lỗi trùng)
-- ============================================================================

-- 1. BẬT CÁC EXTENSION CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CẬP NHẬT HOẶC TẠO MỚI CÁC ENUM TYPE
DO $$ BEGIN
  CREATE TYPE match_status_enum AS ENUM ('open', 'matched', 'playing', 'completed', 'cancelled', 'expired', 'disputed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Bổ sung giá trị 'expired' và 'playing' vào enum nếu đã tạo trước đó
DO $$ BEGIN
  ALTER TYPE match_status_enum ADD VALUE IF NOT EXISTS 'expired';
  ALTER TYPE match_status_enum ADD VALUE IF NOT EXISTS 'playing';
  ALTER TYPE match_status_enum ADD VALUE IF NOT EXISTS 'disputed';
EXCEPTION
  WHEN others THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE deposit_status_enum AS ENUM ('pending', 'verified', 'refunded', 'forfeited');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. BẢNG NGƯỜI DÙNG (USERS) — ĐỒNG BỘ VỚI SUPABASE AUTH
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. BẢNG ĐỘI BÓNG (TEAMS) — QUY CHUẨN 1 SĐT = 1 ĐỘI TRƯỞNG
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    captain_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    team_name VARCHAR(100) NOT NULL,
    captain_name VARCHAR(100),
    captain_phone VARCHAR(20),
    captain_zalo VARCHAR(20),
    jersey_color VARCHAR(30) DEFAULT 'Đỏ',
    logo_url TEXT,
    avg_age INT DEFAULT 28,
    skill_tier INT NOT NULL CHECK (skill_tier IN (1, 2, 3)), -- 1: Dưỡng sinh, 2: Phong trào, 3: Phủi chiến
    trust_score INT NOT NULL DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 100),
    late_cancels_count INT NOT NULL DEFAULT 0,
    clean_streak_count INT NOT NULL DEFAULT 0,
    has_warning_badge BOOLEAN NOT NULL DEFAULT FALSE,
    home_district VARCHAR(50) NOT NULL DEFAULT 'CauGiay',
    bank_account_no VARCHAR(50),
    bank_account_name VARCHAR(100),
    bank_code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động bổ sung các cột nếu bảng teams đã được tạo trước đó
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS captain_name VARCHAR(100);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS captain_phone VARCHAR(20);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS captain_zalo VARCHAR(20);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS jersey_color VARCHAR(30) DEFAULT 'Đỏ';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS clean_streak_count INT DEFAULT 0;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS has_warning_badge BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- 5. BẢNG CỤM SÂN BÓNG (PITCHES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pitches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    turf_condition VARCHAR(100) DEFAULT 'Sân khô ráo, đinh TF tiêu chuẩn',
    is_partner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nạp sẵn danh mục 5 cụm sân trọng điểm Cầu Giấy & Nam Từ Liêm
INSERT INTO public.pitches (name, address, district, turf_condition, is_partner) VALUES
('Sân Trung Kính Hạ', 'Ngõ 2 Tú Mỡ, P. Yên Hòa, Cầu Giấy', 'CauGiay', 'Sân khô ráo 100%, đèn LED sáng rõ', TRUE),
('Sân Thành Phát', 'Số 2 Hoàng Minh Giám, Trung Hòa, Cầu Giấy', 'CauGiay', 'Thời tiết lý tưởng, mặt cỏ mới', TRUE),
('Sân Mễ Trì Hạ', 'Gần khách sạn The Garden, Mễ Trì, Nam Từ Liêm', 'NamTuLiem', 'Có sương nhẹ buổi tối, đinh dăm tốt', TRUE),
('Sân ĐH Thương Mại', '79 Hồ Tùng Mậu, Mai Dịch, Cầu Giấy', 'CauGiay', 'Trời quang, bãi đỗ xe thông thoáng', FALSE),
('Sân Đình Thôn', 'Ngõ 54 Đình Thôn, Mỹ Đình, Nam Từ Liêm', 'NamTuLiem', 'Thoát nước nhanh, đá bình thường', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. BẢNG KÈO ĐẤU (MATCHES) — ĐỒNG BỘ NGÀY THÁNG & GIỜ BÓNG LĂN
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    guest_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    pitch_id UUID REFERENCES public.pitches(id),
    pitch_custom_name VARCHAR(150) NOT NULL,
    district VARCHAR(50) NOT NULL,
    kickoff_time TIMESTAMPTZ NOT NULL,
    time_slot_label VARCHAR(50) NOT NULL,
    total_fee INT NOT NULL DEFAULT 700000,
    split_fee INT NOT NULL DEFAULT 350000,
    deposit_amount INT NOT NULL DEFAULT 200000,
    is_sos BOOLEAN NOT NULL DEFAULT FALSE,
    subsidy_notes TEXT,
    notes TEXT,
    status match_status_enum NOT NULL DEFAULT 'open',
    matched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. BẢNG GIAO DỊCH KÝ QUỸ (ESCROW_DEPOSITS) — CỐ ĐỊNH 200K
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.escrow_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id),
    amount INT NOT NULL DEFAULT 200000,
    bank_account_no VARCHAR(50) DEFAULT '07440948327598',
    bank_name VARCHAR(50) DEFAULT 'MB Bank',
    account_holder VARCHAR(100) DEFAULT 'TRAN QUOC THIEN PHUOC',
    transfer_memo VARCHAR(100) NOT NULL,
    status deposit_status_enum NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. BẢNG ĐÁNH GIÁ MÙ 2 CHIỀU (BLIND_REVIEWS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blind_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    reviewer_team_id UUID NOT NULL REFERENCES public.teams(id),
    reviewed_team_id UUID NOT NULL REFERENCES public.teams(id),
    punctuality_stars INT NOT NULL CHECK (punctuality_stars BETWEEN 1 AND 5),
    fairplay_stars INT NOT NULL CHECK (fairplay_stars BETWEEN 1 AND 5),
    payment_stars INT NOT NULL CHECK (payment_stars BETWEEN 1 AND 5),
    verified_tier VARCHAR(20) DEFAULT 'match',
    comment TEXT,
    is_revealed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. BẢNG CHỢ CẦU LẺ & BẢNG ĐIỂM DANH QUÂN SỐ
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sub_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    team_id UUID REFERENCES public.teams(id),
    author_name VARCHAR(100) NOT NULL,
    position_code VARCHAR(10) NOT NULL CHECK (position_code IN ('GK', 'DF', 'MF', 'FW')),
    position_title VARCHAR(100) NOT NULL,
    pitch_location TEXT NOT NULL,
    fee_share_text VARCHAR(100) NOT NULL DEFAULT 'Miễn phí tiền sân',
    phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.squad_roll_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    member_name VARCHAR(100) NOT NULL,
    member_role VARCHAR(50) DEFAULT 'Cầu thủ',
    status VARCHAR(20) NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'absent', 'pending')),
    is_paid BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. TỰ ĐỘNG SAO CHÉP TÀI KHOẢN GOOGLE AUTH SANG BẢNG USERS (TRIGGER QUAN TRỌNG)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url, phone, is_phone_verified)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1),
      'Đội Trưởng Google'
    ),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      NULL
    ),
    new.phone,
    CASE WHEN new.phone IS NOT NULL THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
      updated_at = NOW();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 11. CÁC STORED PROCEDURES NGHIỆP VỤ (RPC)
-- ============================================================================

-- RPC 1: Bắt đối nguyên tử & Chống trùng kèo (Row-Level Locking)
CREATE OR REPLACE FUNCTION public.fn_lock_and_match(
    p_match_id UUID,
    p_guest_team_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_match RECORD;
    v_guest_team RECORD;
    v_deposit_count INT;
BEGIN
    SELECT * INTO v_match
    FROM public.matches
    WHERE id = p_match_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy thông tin trận đấu.');
    END IF;

    IF v_match.status != 'open' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Kèo đấu này vừa có đội khác bắt trước bạn hoặc đã đóng.');
    END IF;

    IF v_match.host_team_id = p_guest_team_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Bạn không thể tự nhận kèo do chính đội mình tạo.');
    END IF;

    SELECT * INTO v_guest_team
    FROM public.teams
    WHERE id = p_guest_team_id;

    IF v_guest_team.trust_score < 70 THEN
        SELECT COUNT(*) INTO v_deposit_count
        FROM public.escrow_deposits
        WHERE match_id = p_match_id AND team_id = p_guest_team_id AND status = 'verified';

        IF v_deposit_count = 0 THEN
            RETURN jsonb_build_object(
                'success', false, 
                'require_deposit', true,
                'deposit_amount', 200000,
                'message', 'Điểm tín nhiệm của bạn < 70. Vui lòng ký quỹ cọc 200.000đ vào STK BQT 07440948327598 - MB Bank (TRAN QUOC THIEN PHUOC) để chốt kèo.'
            );
        END IF;
    END IF;

    UPDATE public.matches
    SET guest_team_id = p_guest_team_id,
        status = 'matched',
        matched_at = NOW(),
        updated_at = NOW()
    WHERE id = p_match_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Chốt bắt kèo thành công!',
        'match_id', p_match_id
    );
END;
$$;

-- RPC 2: Tự động dọn dẹp các kèo quá 15 phút sau giờ bóng lăn (Đúng Ngày & Giờ)
CREATE OR REPLACE FUNCTION public.fn_auto_cleanup_expired_matches()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE public.matches
    SET status = 'expired',
        notes = COALESCE(notes, '') || ' [Tự động đóng bài đăng do quá giờ bóng lăn 15 phút]',
        updated_at = NOW()
    WHERE status = 'open'
      AND kickoff_time <= (NOW() - INTERVAL '15 minutes');

    GET DIAGNOSTICS v_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'cleaned_count', v_count,
        'timestamp', NOW()
    );
END;
$$;

-- RPC 3: Xử lý hủy kèo bậc thang (< 1h, 1-4h, > 4h)
CREATE OR REPLACE FUNCTION public.fn_process_cancellation(
    p_match_id UUID,
    p_cancelling_team_id UUID,
    p_reason TEXT DEFAULT 'Hủy đột xuất'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_match RECORD;
    v_team RECORD;
    v_hours_before NUMERIC;
    v_penalty INT := 0;
    v_new_trust INT;
    v_new_cancels INT;
    v_has_badge BOOLEAN;
    v_msg TEXT;
BEGIN
    SELECT * INTO v_match FROM public.matches WHERE id = p_match_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Trận đấu không tồn tại.');
    END IF;

    SELECT * INTO v_team FROM public.teams WHERE id = p_cancelling_team_id;

    v_hours_before := EXTRACT(EPOCH FROM (v_match.kickoff_time - NOW())) / 3600;

    IF v_hours_before >= 4 THEN
        v_penalty := 0;
        v_new_trust := v_team.trust_score;
        v_new_cancels := v_team.late_cancels_count;
        v_has_badge := v_team.has_warning_badge;
        v_msg := 'Hủy sớm hợp lệ (> 4 tiếng). Không bị trừ điểm tín nhiệm.';
    ELSIF v_hours_before >= 1 AND v_hours_before < 4 THEN
        v_penalty := 5;
        v_new_trust := GREATEST(0, v_team.trust_score - 5);
        v_new_cancels := v_team.late_cancels_count;
        v_has_badge := v_team.has_warning_badge;
        v_msg := 'Hủy cận giờ (1h–4h). Bị trừ nhẹ 5 điểm tín nhiệm. Kèo đã chuyển sang mục SOS.';
    ELSE
        v_new_cancels := v_team.late_cancels_count + 1;
        IF v_new_cancels = 1 THEN
            v_penalty := 25;
            v_new_trust := GREATEST(0, v_team.trust_score - 25);
            v_has_badge := FALSE;
            v_msg := 'Vi phạm bùng kèo < 1 tiếng lần đầu: Bị trừ 25 điểm tín nhiệm.';
        ELSE
            v_penalty := 40;
            v_new_trust := GREATEST(0, v_team.trust_score - 40);
            v_has_badge := TRUE;
            v_msg := 'Tái phạm bùng kèo sát giờ: Bị trừ 40 điểm tín nhiệm và gắn nhãn đỏ "Từng bùng kèo" công khai!';
        END IF;
    END IF;

    UPDATE public.teams
    SET trust_score = v_new_trust,
        late_cancels_count = v_new_cancels,
        has_warning_badge = v_has_badge,
        clean_streak_count = 0,
        updated_at = NOW()
    WHERE id = p_cancelling_team_id;

    IF v_hours_before < 4 AND v_match.status = 'matched' THEN
        UPDATE public.matches
        SET status = 'open',
            is_sos = TRUE,
            guest_team_id = NULL,
            subsidy_notes = 'Hỗ trợ giảm 100k tiền sân do đối bùng kèo sát giờ',
            split_fee = GREATEST(100000, split_fee - 100000),
            updated_at = NOW()
        WHERE id = p_match_id;
    ELSE
        UPDATE public.matches
        SET status = 'cancelled',
            cancelled_at = NOW(),
            updated_at = NOW()
        WHERE id = p_match_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'team_name', v_team.team_name,
        'penalty_points', v_penalty,
        'new_trust_score', v_new_trust,
        'has_warning_badge', v_has_badge,
        'message', v_msg
    );
END;
$$;

-- RPC 4: Hoàn thành 5 trận văn minh để gỡ nhãn phạt
CREATE OR REPLACE FUNCTION public.fn_complete_clean_match(
    p_team_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_team RECORD;
    v_new_trust INT;
    v_new_streak INT;
    v_badge_removed BOOLEAN := FALSE;
BEGIN
    SELECT * INTO v_team FROM public.teams WHERE id = p_team_id;

    v_new_trust := LEAST(100, v_team.trust_score + 5);
    v_new_streak := v_team.clean_streak_count + 1;

    IF (v_team.has_warning_badge OR v_team.late_cancels_count > 0) AND v_new_streak >= 5 THEN
        v_badge_removed := TRUE;
        UPDATE public.teams
        SET trust_score = v_new_trust,
            has_warning_badge = FALSE,
            late_cancels_count = 0,
            clean_streak_count = 0,
            updated_at = NOW()
        WHERE id = p_team_id;
    ELSE
        UPDATE public.teams
        SET trust_score = v_new_trust,
            clean_streak_count = v_new_streak,
            updated_at = NOW()
        WHERE id = p_team_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'new_trust_score', v_new_trust,
        'clean_streak', v_new_streak,
        'badge_removed', v_badge_removed,
        'message', CASE 
            WHEN v_badge_removed THEN 'Tuyệt vời! Đội bạn đã hoàn thành 5 trận văn minh liên tiếp và được gỡ nhãn "Từng bùng kèo"!'
            ELSE 'Cộng +5 điểm tín nhiệm cho trận đấu fair-play!'
        END
    );
END;
$$;

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES — MỞ ĐẦY ĐỦ QUYỀN ĐỌC GHI
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blind_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_roll_calls ENABLE ROW LEVEL SECURITY;

-- Quyền đọc công khai
DROP POLICY IF EXISTS "Public Read Users" ON public.users;
CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Pitches" ON public.pitches;
CREATE POLICY "Public Read Pitches" ON public.pitches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Teams" ON public.teams;
CREATE POLICY "Public Read Teams" ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Matches" ON public.matches;
CREATE POLICY "Public Read Matches" ON public.matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Sub Players" ON public.sub_players;
CREATE POLICY "Public Read Sub Players" ON public.sub_players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Roll Calls" ON public.squad_roll_calls;
CREATE POLICY "Public Read Roll Calls" ON public.squad_roll_calls FOR SELECT USING (true);

-- Quyền ghi cho Users & Teams
DROP POLICY IF EXISTS "Users Insert Profile" ON public.users;
CREATE POLICY "Users Insert Profile" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users Update Profile" ON public.users;
CREATE POLICY "Users Update Profile" ON public.users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Captain Manage Team" ON public.teams;
CREATE POLICY "Captain Manage Team" ON public.teams FOR ALL USING (true);

DROP POLICY IF EXISTS "Manage Matches" ON public.matches;
CREATE POLICY "Manage Matches" ON public.matches FOR ALL USING (true);

DROP POLICY IF EXISTS "Manage Sub Players" ON public.sub_players;
CREATE POLICY "Manage Sub Players" ON public.sub_players FOR ALL USING (true);

DROP POLICY IF EXISTS "Manage Reviews" ON public.blind_reviews;
CREATE POLICY "Manage Reviews" ON public.blind_reviews FOR ALL USING (true);

DROP POLICY IF EXISTS "Manage Deposits" ON public.escrow_deposits;
CREATE POLICY "Manage Deposits" ON public.escrow_deposits FOR ALL USING (true);
