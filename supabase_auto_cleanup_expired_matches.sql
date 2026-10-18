-- ==============================================================================
-- SUPABASE MIGRATION: CƠ CHẾ TỰ ĐỘNG DỌN DẸP & XÓA KÈO QUÁ HẠN 15 PHÚT
-- Dự án: Nền tảng GiaoHuu.vn / BắtKèo7 Sân 7 Hà Nội
-- Quy tắc: Tự động đóng và ẩn bài đăng tìm đối quá 15 phút sau giờ bóng lăn (status = 'open')
-- Cam kết: Đội tạo kèo KHÔNG bị trừ điểm uy tín, tiền cọc bảo lưu 100%
-- ==============================================================================

-- 1. Bổ sung trạng thái 'expired' vào Enum match_status_enum (nếu có sử dụng type enum)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status_enum') THEN
        ALTER TYPE match_status_enum ADD VALUE IF NOT EXISTS 'expired';
    END IF;
END $$;

-- 2. Thêm cột expires_at vào bảng matches nếu chưa tồn tại
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 3. Đánh index tối ưu hiệu năng lọc kèo mở và quét cron
CREATE INDEX IF NOT EXISTS idx_matches_status_expires 
ON public.matches (status, expires_at) 
WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_matches_status_kickoff 
ON public.matches (status, kickoff_time) 
WHERE status = 'open';

-- 4. Trigger tự động gán: expires_at = kickoff_time + 15 phút khi tạo/cập nhật kèo
CREATE OR REPLACE FUNCTION public.fn_set_match_expires_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.expires_at IS NULL THEN
        IF NEW.kickoff_time IS NOT NULL THEN
            NEW.expires_at := NEW.kickoff_time + INTERVAL '15 minutes';
        ELSE
            NEW.expires_at := NOW() + INTERVAL '2 hours 15 minutes';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_match_expires_at ON public.matches;
CREATE TRIGGER trg_set_match_expires_at
BEFORE INSERT OR UPDATE OF kickoff_time ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.fn_set_match_expires_at();

-- 5. Cập nhật dữ liệu cho các kèo open hiện tại chưa có expires_at
UPDATE public.matches
SET expires_at = kickoff_time + INTERVAL '15 minutes'
WHERE expires_at IS NULL AND kickoff_time IS NOT NULL;

-- 6. Hàm thủ tục dọn dẹp hàng loạt fn_auto_cleanup_expired_matches
CREATE OR REPLACE FUNCTION public.fn_auto_cleanup_expired_matches()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cleaned_count INT := 0;
BEGIN
    UPDATE public.matches
    SET status = 'expired',
        notes = COALESCE(notes, '') || ' [Tự động đóng bài đăng do quá giờ bóng lăn 15 phút chưa có đối]',
        updated_at = NOW()
    WHERE status = 'open'
      AND (
          (expires_at IS NOT NULL AND NOW() >= expires_at)
          OR (expires_at IS NULL AND NOW() >= (kickoff_time + INTERVAL '15 minutes'))
      );

    GET DIAGNOSTICS v_cleaned_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'cleaned_count', v_cleaned_count,
        'timestamp', NOW(),
        'message', format('Đã tự động dọn dẹp và ẩn %s bài đăng quá giờ khỏi trang chủ.', v_cleaned_count)
    );
END;
$$;

-- 7. Cấu hình pg_cron chạy ngầm mỗi 1 phút (Tự động kích hoạt nếu extension pg_cron có sẵn)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
        CREATE EXTENSION IF NOT EXISTS pg_cron;
        
        -- Hủy cron job cũ nếu đã tồn tại để tránh trùng lịch
        PERFORM cron.unschedule('batkeo7-auto-cleanup-expired-matches')
        WHERE EXISTS (
            SELECT 1 FROM cron.job WHERE jobname = 'batkeo7-auto-cleanup-expired-matches'
        );

        -- Lập lịch chạy mỗi phút 1 lần
        PERFORM cron.schedule(
            'batkeo7-auto-cleanup-expired-matches',
            '*/1 * * * *',
            'SELECT public.fn_auto_cleanup_expired_matches();'
        );
    END IF;
END $$;
