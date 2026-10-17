-- ============================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU BẮT KÈO 7 (POSTGRESQL / SUPABASE)
-- Phiên bản: 2.1 (Production-Ready Schema with Atomic Concurrency & Rules)
-- Tương thích: PostgreSQL 15+, Supabase Database, Row Level Security (RLS)
-- ============================================================================

-- BẬT CÁC EXTENSION CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. BẢNG NGƯỜI DÙNG (USERS - LIÊN KẾT VỚI SUPABASE AUTH)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. BẢNG ĐỘI BÓNG (TEAMS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    captain_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    team_name VARCHAR(100) NOT NULL,
    captain_name VARCHAR(100),
    captain_phone VARCHAR(20), -- Số điện thoại nghe gọi trực tiếp (chuẩn 10 số VN)
    captain_zalo VARCHAR(20),  -- Số điện thoại đăng ký Zalo để mở Deep-link https://zalo.me/{sđt}
    jersey_color VARCHAR(30) DEFAULT 'Đỏ',
    logo_url TEXT,
    avg_age INT DEFAULT 28,
    skill_tier INT NOT NULL CHECK (skill_tier IN (1, 2, 3)), -- 1: Dưỡng sinh, 2: Phong trào, 3: Phủi chiến
    trust_score INT NOT NULL DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 100),
    late_cancels_count INT NOT NULL DEFAULT 0,
    clean_streak_count INT NOT NULL DEFAULT 0,
    has_warning_badge BOOLEAN NOT NULL DEFAULT FALSE, -- Gắn nhãn đỏ "Từng bùng kèo" khi vi phạm từ lần 2
    home_district VARCHAR(50) NOT NULL DEFAULT 'CauGiay', -- 'CauGiay' hoặc 'NamTuLiem'
    bank_account_no VARCHAR(50),
    bank_account_name VARCHAR(100),
    bank_code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Đảm bảo tương thích nếu bảng teams đã được tạo trước đó
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS captain_name VARCHAR(100);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS captain_phone VARCHAR(20);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS captain_zalo VARCHAR(20);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS jersey_color VARCHAR(30) DEFAULT 'Đỏ';

-- ----------------------------------------------------------------------------
-- 3. BẢNG CỤM SÂN BÓNG (PITCHES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pitches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(50) NOT NULL, -- 'CauGiay', 'NamTuLiem'
    phone VARCHAR(20),
    turf_condition VARCHAR(100) DEFAULT 'Sân khô ráo, đinh TF tiêu chuẩn',
    is_partner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nạp sẵn 5 cụm sân mẫu khu vực Cầu Giấy & Nam Từ Liêm
INSERT INTO public.pitches (name, address, district, turf_condition, is_partner) VALUES
('Sân Trung Kính Hạ', 'Ngõ 2 Tú Mỡ, P. Yên Hòa, Cầu Giấy', 'CauGiay', 'Sân khô ráo 100%, đèn LED sáng rõ', TRUE),
('Sân Thành Phát', 'Số 2 Hoàng Minh Giám, Trung Hòa, Cầu Giấy', 'CauGiay', 'Thời tiết lý tưởng, mặt cỏ mới', TRUE),
('Sân Mễ Trì Hạ', 'Gần khách sạn The Garden, Mễ Trì, Nam Từ Liêm', 'NamTuLiem', 'Có sương nhẹ buổi tối, đinh dăm tốt', TRUE),
('Sân ĐH Thương Mại', '79 Hồ Tùng Mậu, Mai Dịch, Cầu Giấy', 'CauGiay', 'Trời quang, bãi đỗ xe thông thoáng', FALSE),
('Sân Đình Thôn', 'Ngõ 54 Đình Thôn, Mỹ Đình, Nam Từ Liêm', 'NamTuLiem', 'Thoát nước nhanh, đá bình thường', FALSE)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. BẢNG KÈO ĐẤU (MATCHES)
-- ----------------------------------------------------------------------------
CREATE TYPE match_status_enum AS ENUM ('open', 'matched', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    guest_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    pitch_id UUID REFERENCES public.pitches(id),
    pitch_custom_name VARCHAR(150) NOT NULL,
    district VARCHAR(50) NOT NULL,
    kickoff_time TIMESTAMPTZ NOT NULL, -- Giờ bóng lăn chuẩn
    time_slot_label VARCHAR(50) NOT NULL, -- '17:30', '19:00', '20:30'
    total_fee INT NOT NULL DEFAULT 700000,
    split_fee INT NOT NULL DEFAULT 350000,
    deposit_amount INT NOT NULL DEFAULT 200000, -- Cố định 200.000 VNĐ cho đội cần ký quỹ
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

-- ----------------------------------------------------------------------------
-- 5. BẢNG GIAO DỊCH KÝ QUỸ TIỀN CỌC (ESCROW_DEPOSITS)
-- Ban Quản Trị: TRAN QUOC THIEN PHUOC - MB Bank - STK: 07440948327598
-- ----------------------------------------------------------------------------
CREATE TYPE deposit_status_enum AS ENUM ('pending', 'verified', 'refunded', 'forfeited');

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

-- ----------------------------------------------------------------------------
-- 6. BẢNG ĐÁNH GIÁ MÙ 2 CHIỀU (BLIND_REVIEWS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blind_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    reviewer_team_id UUID NOT NULL REFERENCES public.teams(id),
    reviewed_team_id UUID NOT NULL REFERENCES public.teams(id),
    punctuality_stars INT NOT NULL CHECK (punctuality_stars BETWEEN 1 AND 5),
    fairplay_stars INT NOT NULL CHECK (fairplay_stars BETWEEN 1 AND 5),
    payment_stars INT NOT NULL CHECK (payment_stars BETWEEN 1 AND 5),
    verified_tier VARCHAR(20) DEFAULT 'match', -- 'match' (đúng trình), 'higher' (đá rát, trình cao hơn)
    comment TEXT,
    is_revealed BOOLEAN NOT NULL DEFAULT FALSE, -- Chỉ mở khi cả 2 bên cùng hoàn tất hoặc sau 24h
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. BẢNG CHỢ CẦU LẺ (SUB_PLAYERS)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 8. BẢNG THÀNH VIÊN ĐỘI & ĐIỂM DANH QUÂN SỐ NỘI BỘ (SQUAD_ROLL_CALLS)
-- ----------------------------------------------------------------------------
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
-- LOGIC STORED PROCEDURES & BUSINESS TRANSACTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- HÀM 1: BẮT ĐỐI NGUYÊN TỬ VÀ CHỐNG TRÙNG KÈO (ROW-LEVEL LOCKING)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_lock_and_match(
    p_match_id UUID,
    p_guest_team_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_match RECORD;
    v_guest_team RECORD;
    v_deposit_count INT;
BEGIN
    -- 1. Khóa cứng bản ghi trận đấu với SELECT FOR UPDATE
    SELECT * INTO v_match
    FROM public.matches
    WHERE id = p_match_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy thông tin trận đấu.');
    END IF;

    -- Kiểm tra trạng thái trận
    IF v_match.status != 'open' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Kèo đấu này vừa có đội khác bắt trước bạn hoặc đã đóng.');
    END IF;

    -- Không cho tự bắt kèo của chính mình
    IF v_match.host_team_id = p_guest_team_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Bạn không thể tự nhận kèo do chính đội mình tạo.');
    END IF;

    -- 2. Kiểm tra uy tín đội nhận kèo
    SELECT * INTO v_guest_team
    FROM public.teams
    WHERE id = p_guest_team_id;

    -- Nếu điểm tín nhiệm < 70đ, bắt buộc phải có bản ghi cọc 200.000đ đã xác nhận
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

    -- 3. Khóa kèo thành công
    UPDATE public.matches
    SET guest_team_id = p_guest_team_id,
        status = 'matched',
        matched_at = NOW(),
        updated_at = NOW()
    WHERE id = p_match_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Chốt bắt kèo thành công!',
        'match_id', p_match_id,
        'match_data', row_to_json(v_match)
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- HÀM 2: XỬ LÝ HỦY KÈO BẬC THANG THEO KHUNG GIỜ (< 1H, 1-4H, > 4H)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_process_cancellation(
    p_match_id UUID,
    p_cancelling_team_id UUID,
    p_reason TEXT DEFAULT 'Hủy đột xuất'
)
RETURNS JSONB
LANGUAGE plpgsql
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

    -- Tính số giờ còn lại trước khi bóng lăn
    v_hours_before := EXTRACT(EPOCH FROM (v_match.kickoff_time - NOW())) / 3600;

    -- ÁP DỤNG QUY CHUẨN ĐÃ KHÓA:
    IF v_hours_before >= 4 THEN
        -- Khung 1: Hủy sớm > 4 tiếng: 0 điểm phạt
        v_penalty := 0;
        v_new_trust := v_team.trust_score;
        v_new_cancels := v_team.late_cancels_count;
        v_has_badge := v_team.has_warning_badge;
        v_msg := 'Hủy sớm hợp lệ (> 4 tiếng). Không bị trừ điểm tín nhiệm.';

    ELSIF v_hours_before >= 1 AND v_hours_before < 4 THEN
        -- Khung 2: Hủy cận giờ (1h - 4h): Trừ nhẹ 5 điểm, đẩy sang SOS
        v_penalty := 5;
        v_new_trust := GREATEST(0, v_team.trust_score - 5);
        v_new_cancels := v_team.late_cancels_count;
        v_has_badge := v_team.has_warning_badge;
        v_msg := 'Hủy cận giờ (1h–4h). Bị trừ nhẹ 5 điểm tín nhiệm. Kèo đã chuyển sang mục SOS.';

    ELSE
        -- Khung 3: Bùng kèo sát giờ < 1 tiếng (Quy chuẩn bậc thang)
        v_new_cancels := v_team.late_cancels_count + 1;
        
        IF v_new_cancels = 1 THEN
            -- Vi phạm lần 1: Trừ 25đ, CHƯA gắn nhãn công khai (chỉ cảnh cáo nội bộ)
            v_penalty := 25;
            v_new_trust := GREATEST(0, v_team.trust_score - 25);
            v_has_badge := FALSE;
            v_msg := 'Vi phạm bùng kèo < 1 tiếng lần đầu: Bị trừ 25 điểm tín nhiệm. Hệ thống chưa gắn nhãn công khai để tạo cơ hội sửa sai.';
        ELSE
            -- Vi phạm từ lần 2 trở đi: Trừ 40đ, GẮN NHÃN ĐỎ "Từng bùng kèo" công khai
            v_penalty := 40;
            v_new_trust := GREATEST(0, v_team.trust_score - 40);
            v_has_badge := TRUE;
            v_msg := 'Tái phạm bùng kèo sát giờ: Bị trừ 40 điểm tín nhiệm và gắn nhãn đỏ "Từng bùng kèo" công khai trên toàn hệ thống!';
        END IF;
    END IF;

    -- Cập nhật dữ liệu đội bóng
    UPDATE public.teams
    SET trust_score = v_new_trust,
        late_cancels_count = v_new_cancels,
        has_warning_badge = v_has_badge,
        clean_streak_count = 0, -- Reset chuỗi trận đẹp
        updated_at = NOW()
    WHERE id = p_cancelling_team_id;

    -- Đổi trạng thái trận đấu
    IF v_hours_before < 4 AND v_match.status = 'matched' THEN
        -- Chuyển thành kèo SOS khẩn cấp
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

-- ----------------------------------------------------------------------------
-- HÀM 3: XỬ LÝ HOÀN THÀNH TRẬN VĂN MINH & XÓA ÁN TÍCH (5 TRẬN 5★)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_complete_clean_match(
    p_team_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_team RECORD;
    v_new_trust INT;
    v_new_streak INT;
    v_badge_removed BOOLEAN := FALSE;
BEGIN
    SELECT * INTO v_team FROM public.teams WHERE id = p_team_id;

    -- Cộng 5 điểm tín nhiệm mỗi trận văn minh (tối đa 100đ)
    v_new_trust := LEAST(100, v_team.trust_score + 5);
    v_new_streak := v_team.clean_streak_count + 1;

    -- Nếu đang có nhãn phạt hoặc có lịch sử bùng kèo và hoàn thành đủ 5 trận liên tiếp
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
-- CẤU HÌNH BẢO MẬT PHÂN QUYỀN (ROW LEVEL SECURITY - RLS)
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blind_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_roll_calls ENABLE ROW LEVEL SECURITY;

-- Ai cũng có thể xem danh sách kèo đang mở và bảng tin chợ cầu lẻ
CREATE POLICY "Public Read Matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public Read Pitches" ON public.pitches FOR SELECT USING (true);
CREATE POLICY "Public Read Sub Players" ON public.sub_players FOR SELECT USING (true);
CREATE POLICY "Public Read Teams" ON public.teams FOR SELECT USING (true);

-- Chỉ đội trưởng mới được sửa thông tin đội và tạo kèo
CREATE POLICY "Captain Manage Team" ON public.teams FOR ALL USING (auth.uid() = captain_id);
CREATE POLICY "Captain Manage Match" ON public.matches FOR ALL USING (
    auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = host_team_id)
);

-- Đánh giá mù chỉ xem được khi is_revealed = true hoặc là chính người viết
CREATE POLICY "Blind Review Privacy" ON public.blind_reviews FOR SELECT USING (
    is_revealed = TRUE OR auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = reviewer_team_id)
);
