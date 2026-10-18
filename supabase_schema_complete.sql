-- ============================================================================
-- BẮTKÈO7 - TỔNG HỢP TOÀN BỘ CƠ SỞ DỮ LIỆU SUPABASE CHUẨN PRODUCTION
-- Chạy an toàn 100% trong Supabase Dashboard -> SQL Editor (Hỗ trợ IF NOT EXISTS)
-- ============================================================================

-- BƯỚC 1: KÍCH HOẠT EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- BƯỚC 2: BẢNG USERS (HỒ SƠ NGƯỜI DÙNG / ĐỘI TRƯỞNG)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone varchar(20) UNIQUE,
  is_phone_verified boolean DEFAULT true,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Thêm cột nếu bảng users đã tồn tại từ trước
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone varchar(20);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_phone_verified boolean DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- ============================================================================
-- BƯỚC 3: BẢNG TEAMS (HỒ SƠ ĐỘI BÓNG & ĐIỂM TÍN NHIỆM FAIR-PLAY)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  captain_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  team_name varchar(150) NOT NULL,
  captain_name varchar(100),
  captain_phone varchar(20),
  captain_zalo varchar(20),
  jersey_color varchar(50) DEFAULT 'Đỏ truyền thống',
  avg_age integer DEFAULT 28,
  skill_tier integer DEFAULT 2,
  trust_score integer DEFAULT 100,
  late_cancels_count integer DEFAULT 0,
  clean_streak_count integer DEFAULT 0,
  has_warning_badge boolean DEFAULT false,
  home_district varchar(50) DEFAULT 'CauGiay',
  bank_account_no varchar(50),
  bank_account_name varchar(100),
  bank_code varchar(20) DEFAULT 'MB',
  created_at timestamptz DEFAULT now()
);

-- Thêm đầy đủ các cột bổ sung cho bảng teams (tránh thiếu sót)
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS captain_name VARCHAR(100);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS captain_phone VARCHAR(20);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS captain_zalo VARCHAR(20);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS jersey_color VARCHAR(50) DEFAULT 'Đỏ truyền thống';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS avg_age INTEGER DEFAULT 28;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS skill_tier INTEGER DEFAULT 2;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 100;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS late_cancels_count INTEGER DEFAULT 0;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS clean_streak_count INTEGER DEFAULT 0;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS has_warning_badge BOOLEAN DEFAULT false;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS home_district VARCHAR(50) DEFAULT 'CauGiay';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS bank_account_no VARCHAR(50);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(100);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS bank_code VARCHAR(20) DEFAULT 'MB';

-- ============================================================================
-- BƯỚC 4: BẢNG MATCHES (BẢNG TIN KÈO ĐẤU & KÈO SOS CẤP CỨU)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  host_team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  guest_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  pitch_custom_name text NOT NULL,
  district varchar(50) DEFAULT 'Cầu Giấy',
  kickoff_time timestamptz DEFAULT (now() + interval '2 hours'),
  time_slot_label varchar(50) DEFAULT '19:00 - 20:30',
  total_fee numeric DEFAULT 800000,
  split_fee numeric DEFAULT 400000,
  is_sos boolean DEFAULT false,
  status varchar(20) DEFAULT 'open',
  notes text,
  gmaps_url text,
  is_gmaps_integrated boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Thêm các cột bản đồ Google Maps và trạng thái kèo
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS gmaps_url text;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS is_gmaps_integrated boolean DEFAULT true;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'open';
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS is_sos boolean DEFAULT false;

-- ============================================================================
-- BƯỚC 5: BẢNG MATCH_APPEALS (ĐƠN KHÁNG CÁO HỦY KÈO BẤT KHẢ KHÁNG)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.match_appeals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  appeal_code text NOT NULL,
  match_id text,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  team_name text NOT NULL,
  captain_name text,
  captain_phone text,
  pitch_name text,
  district text,
  time_slot text,
  penalty_points integer DEFAULT 25,
  reason_label text,
  reason_detail text,
  manager_verify_phone text,
  status text DEFAULT 'PENDING',
  admin_note text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- BƯỚC 6: BẢNG WITHDRAW_REQUESTS (YÊU CẦU RÚT TIỀN KÝ QUỸ / HOÀN CỌC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.withdraw_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name text NOT NULL,
  captain_phone varchar(20) NOT NULL,
  amount numeric NOT NULL,
  bank_name varchar(100) NOT NULL,
  account_number varchar(50) NOT NULL,
  account_name varchar(100) NOT NULL,
  status varchar(20) DEFAULT 'pending',
  admin_note text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- BƯỚC 7: KÍCH HOẠT REALTIME WEBSOCKET (ZERO RELOAD CHO BẢNG TIN KÈO ĐẤU)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;
END $$;

-- ============================================================================
-- BƯỚC 8: BẬT ROW LEVEL SECURITY (RLS) VÀ PHÂN QUYỀN TRUY CẬP HỢP LỆ
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;

-- Chính sách đọc công khai cho Matches (để khách chưa login vẫn xem được kèo)
DROP POLICY IF EXISTS "Public can read matches" ON public.matches;
CREATE POLICY "Public can read matches" ON public.matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read teams" ON public.teams;
CREATE POLICY "Public can read teams" ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read users" ON public.users;
CREATE POLICY "Public can read users" ON public.users FOR SELECT USING (true);

-- Cho phép Service Role (Admin client từ Server Actions) toàn quyền Insert/Update/Delete
-- (Client dùng getAdminClient() với SUPABASE_SERVICE_ROLE_KEY tự động bypass RLS an toàn)
