/**
 * Bộ công cụ chuẩn hóa Số Điện Thoại & Deep-Link Zalo 1-Click cho Đội trưởng Phủi Việt Nam
 * Giải quyết triệt để vấn đề:
 * 1. Đội trưởng nhập SĐT có dấu chấm/cách/+84 (VD: "0988.765.432", "+84 988 765 432") khiến link Zalo bị lỗi.
 * 2. Đội trưởng dùng số Zalo khác với số nghe gọi chính.
 * 3. Che số điện thoại trên bảng tin công khai (0988.***432) chống spam, chỉ mở khóa khi đã chốt kèo.
 * 4. Tự động tạo mẫu tin nhắn chốt kèo để copy 1-chạm và dán thẳng vào Zalo.
 */

const OLD_CARRIER_PREFIX_MAP: Record<string, string> = {
  "0162": "032",
  "0163": "033",
  "0164": "034",
  "0165": "035",
  "0166": "036",
  "0167": "037",
  "0168": "038",
  "0169": "039",
  "0120": "070",
  "0121": "079",
  "0122": "077",
  "0126": "076",
  "0128": "078",
  "0123": "083",
  "0124": "084",
  "0125": "085",
  "0127": "081",
  "0129": "082",
  "0186": "056",
  "0188": "058",
  "0199": "059",
};

/**
 * Chuẩn hóa số điện thoại về chuỗi 10 chữ số thuần túy (VD: "0988765432")
 */
export function normalizeVietnamPhone(rawPhone?: string | null): string {
  if (!rawPhone) return "";

  // 1. Xóa toàn bộ ký tự không phải chữ số và dấu +
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, "");

  // 2. Chuyển đổi mã vùng quốc tế +84 hoặc 84 ở đầu thành số 0
  if (cleaned.startsWith("+84")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("84") && cleaned.length >= 11) {
    cleaned = "0" + cleaned.slice(2);
  }

  // 3. Chỉ giữ lại các chữ số
  cleaned = cleaned.replace(/\D/g, "");

  // 4. Nếu người dùng nhập 9 chữ số (thiếu số 0 ở đầu, VD: 988765432)
  if (cleaned.length === 9 && /^[35789]/.test(cleaned)) {
    cleaned = "0" + cleaned;
  }

  // 5. Chuyển đổi đầu 11 số cũ sang 10 số mới (nếu có)
  if (cleaned.length === 11) {
    const prefix4 = cleaned.slice(0, 4);
    if (OLD_CARRIER_PREFIX_MAP[prefix4]) {
      cleaned = OLD_CARRIER_PREFIX_MAP[prefix4] + cleaned.slice(4);
    }
  }

  return cleaned;
}

/**
 * Kiểm tra xem số điện thoại sau khi chuẩn hóa có đúng chuẩn 10 số di động Việt Nam không
 */
export function isValidVietnamPhone(rawPhone?: string | null): boolean {
  const normalized = normalizeVietnamPhone(rawPhone);
  return /^(03|05|07|08|09)\d{8}$/.test(normalized);
}

/**
 * Định dạng hiển thị số điện thoại dễ đọc (VD: "0988.765.432")
 */
export function formatDisplayPhone(rawPhone?: string | null): string {
  const normalized = normalizeVietnamPhone(rawPhone);
  if (normalized.length === 10) {
    return `${normalized.slice(0, 4)}.${normalized.slice(4, 7)}.${normalized.slice(7)}`;
  }
  return rawPhone || "";
}

/**
 * Che một phần số điện thoại trên Bảng tin công khai để chống cò sân / spam quảng cáo
 * VD: "0988.765.432" -> "0988.***.432"
 */
export function maskPhoneNumber(rawPhone?: string | null): string {
  const normalized = normalizeVietnamPhone(rawPhone);
  if (normalized.length >= 7) {
    return `${normalized.slice(0, 4)}.***.${normalized.slice(-3)}`;
  }
  return "09**.***.***";
}

/**
 * Sinh đường dẫn Deep-link mở thẳng cửa sổ chat Zalo theo SĐT đã chuẩn hóa
 * Ưu tiên lấy số Zalo riêng (captainZalo) nếu đội trưởng dùng 2 số khác nhau
 */
export function getZaloDeepLink(
  captainPhone: string,
  captainZalo?: string | null
): string {
  const targetPhone =
    captainZalo && captainZalo.trim().length > 0 ? captainZalo : captainPhone;
  const normalized = normalizeVietnamPhone(targetPhone);
  return `https://zalo.me/${normalized}`;
}

/**
 * Sinh ảnh QR Code trỏ thẳng vào link Zalo của Đội trưởng
 * Giúp người dùng đang mở Web trên Laptop/PC có thể lấy điện thoại quét mở Zalo ngay
 */
export function getZaloQrImageUrl(
  captainPhone: string,
  captainZalo?: string | null,
  size: number = 180
): string {
  const deepLink = getZaloDeepLink(captainPhone, captainZalo);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(
    deepLink
  )}`;
}

export interface MatchMessageTemplateParams {
  hostCaptainName: string;
  hostTeamName: string;
  guestTeamName: string;
  guestPhone: string;
  guestJerseyColor?: string;
  pitchName: string;
  timeSlot: string;
  matchDate: string;
  shareCostVnd: number;
}

/**
 * Tạo nội dung tin nhắn mẫu chuẩn văn hóa bóng đá phủi để Đội trưởng Copy & Dán vào Zalo/SMS
 */
export function buildMatchZaloMessage(
  params: MatchMessageTemplateParams
): string {
  const formattedGuestPhone = formatDisplayPhone(params.guestPhone);
  const jerseyNote = params.guestJerseyColor
    ? ` Đội em mặc áo màu ${params.guestJerseyColor}.`
    : "";

  return (
    `⚽ [BắtKèo7.vn] Chào anh ${params.hostCaptainName} (${params.hostTeamName}), ` +
    `em là đội trưởng đội ${params.guestTeamName} (SĐT: ${formattedGuestPhone}) ` +
    `vừa chốt bắt kèo ca ${params.timeSlot} (${params.matchDate}) tại ${params.pitchName}.` +
    `${jerseyNote} Tiền sân chia 50/50 (${params.shareCostVnd.toLocaleString("vi-VN")}đ/đội). ` +
    `Anh xác nhận giúp em để anh em lên sân đúng giờ nhé!`
  );
}

/**
 * Tạo link gửi SMS truyền thống dự phòng khi đội trưởng đối phương chưa bật mạng 4G/Zalo
 */
export function getSmsDeepLink(phone: string, messageBody: string): string {
  const normalized = normalizeVietnamPhone(phone);
  return `sms:${normalized}?body=${encodeURIComponent(messageBody)}`;
}

/**
 * Phát âm thanh "Ting-Ting" nhẹ nhàng trên trình duyệt khi có thông báo In-App mới
 * Sử dụng Web Audio API thuần (không phụ thuộc file mp3 bên ngoài)
 */
export function playNotificationChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Nốt 1 (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Nốt 2 (A5 - cao hơn tạo cảm giác tích cực)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {
    // Trình duyệt chặn autoplay nếu chưa tương tác
  }
}
