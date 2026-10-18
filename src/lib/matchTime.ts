/**
 * Tiện ích xử lý Ngày & Giờ thi đấu chuẩn Thời Gian Thực (Real-time Synchronization)
 * & Cơ chế tự động dọn dẹp kèo quá hạn (Đúng Ngày + Giờ bóng lăn + 15 phút)
 * Quy chuẩn: Nền tảng GiaoHuu.vn Sân 7 Hà Nội
 */

/**
 * Lấy chuỗi YYYY-MM-DD theo múi giờ địa phương (Việt Nam)
 */
export function toLocalIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayIsoDate(): string {
  return toLocalIsoDate(new Date());
}

export function getOffsetIsoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toLocalIsoDate(d);
}

/**
 * Danh sách các chip chọn nhanh ngày thi đấu (Hôm nay, Ngày mai, Ngày kia, và các ngày tiếp theo)
 */
export function getQuickDateOptions(count = 5): {
  iso: string;
  shortLabel: string;
  fullLabel: string;
  dayOfWeek: string;
  ddmm: string;
}[] {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const result = [];

  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = toLocalIsoDate(d);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const dow = days[d.getDay()];
    const ddmm = `${dd}/${mm}`;

    let prefix = dow;
    if (i === 0) prefix = "Hôm nay";
    else if (i === 1) prefix = "Ngày mai";
    else if (i === 2) prefix = "Ngày kia";

    result.push({
      iso,
      shortLabel: `${prefix} (${ddmm})`,
      fullLabel: `${prefix}, ${dd}/${mm}/${yyyy}`,
      dayOfWeek: dow,
      ddmm,
    });
  }

  return result;
}

/**
 * Trích xuất giờ và phút từ chuỗi ca giờ (VD: "19:00", "19:00 - 20:30", "19h30", "07:00")
 */
export function parseStartTime(timeStr: string): { hour: number; minute: number } {
  if (!timeStr) return { hour: 19, minute: 0 };

  // Lấy phần đầu nếu có dấu gạch ngang (VD: "19:00 - 20:30" -> "19:00")
  const firstPart = timeStr.split("-")[0].trim().toLowerCase();

  // Xử lý định dạng "19h30" hoặc "7h"
  if (firstPart.includes("h")) {
    const [h, m] = firstPart.split("h");
    return {
      hour: Math.min(23, Math.max(0, parseInt(h, 10) || 0)),
      minute: Math.min(59, Math.max(0, parseInt(m, 10) || 0)),
    };
  }

  // Xử lý định dạng "19:00" hoặc "07:00"
  const parts = firstPart.split(":");
  const parsedHour = parseInt(parts[0], 10);
  const parsedMin = parseInt(parts[1], 10);
  return {
    hour: isNaN(parsedHour) ? 19 : Math.min(23, Math.max(0, parsedHour)),
    minute: isNaN(parsedMin) ? 0 : Math.min(59, Math.max(0, parsedMin)),
  };
}

/**
 * Trích xuất Năm - Tháng - Ngày chính xác từ chuỗi matchDate bất kỳ:
 * Hỗ trợ:
 * - "2026-10-19" (YYYY-MM-DD)
 * - "Ngày mai (19/10/2026)" hoặc "Hôm nay (18/10)" hoặc "19/10/2026" hoặc "19/10"
 * - "Hôm nay", "Ngày mai", "Ngày kia"
 */
export function parseMatchDateParts(matchDateStr?: string): {
  year: number;
  month: number; // 0-indexed (0 = Jan, 9 = Oct)
  day: number;
} {
  const now = new Date();
  const defaultRes = {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };

  if (!matchDateStr) return defaultRes;
  const raw = matchDateStr.trim();

  // 1. Kiểm tra định dạng YYYY-MM-DD (VD: "2026-10-19")
  const isoMatch = raw.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10) - 1,
      day: parseInt(isoMatch[3], 10),
    };
  }

  // 2. Kiểm tra định dạng DD/MM/YYYY hoặc DD/MM nằm trong chuỗi (VD: "Ngày mai (19/10/2026)" hoặc "19/10")
  const slashMatch = raw.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (slashMatch) {
    const d = parseInt(slashMatch[1], 10);
    const m = parseInt(slashMatch[2], 10) - 1;
    let y = slashMatch[3] ? parseInt(slashMatch[3], 10) : now.getFullYear();
    if (y < 100) y += 2000;
    return { year: y, month: m, day: d };
  }

  // 3. Kiểm tra từ khóa tương đối nếu không kèm số ngày
  const lower = raw.toLowerCase();
  if (lower.includes("ngày kia")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }
  if (lower.includes("mai")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }

  return defaultRes;
}

/**
 * Chuyển chuỗi matchDate bất kỳ về chuẩn YYYY-MM-DD để gán vào <input type="date" />
 */
export function normalizeToIsoDate(matchDateStr?: string): string {
  const { year, month, day } = parseMatchDateParts(matchDateStr);
  const d = new Date(year, month, day);
  return toLocalIsoDate(d);
}

/**
 * Định dạng chuỗi ngày hiển thị thân thiện, luôn kèm ngày/tháng thật
 * VD: "2026-10-18" -> "Hôm nay (18/10/2026)"
 * VD: "2026-10-19" -> "Ngày mai (19/10/2026)"
 * VD: "2026-10-22" -> "T5 (22/10/2026)"
 */
export function formatMatchDateDisplay(matchDateInput?: string): string {
  const { year, month, day } = parseMatchDateParts(matchDateInput);
  const target = new Date(year, month, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const dd = String(day).padStart(2, "0");
  const mm = String(month + 1).padStart(2, "0");
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dow = days[target.getDay()];

  if (diffDays === 0) return `Hôm nay (${dd}/${mm}/${year})`;
  if (diffDays === 1) return `Ngày mai (${dd}/${mm}/${year})`;
  if (diffDays === 2) return `Ngày kia (${dd}/${mm}/${year})`;
  return `${dow} (${dd}/${mm}/${year})`;
}

/**
 * Định dạng ngắn gọn cho thẻ kèo: VD "Hôm nay, 18/10" hoặc "Ngày mai, 19/10"
 */
export function formatMatchDateShort(matchDateInput?: string): string {
  const { year, month, day } = parseMatchDateParts(matchDateInput);
  const target = new Date(year, month, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const dd = String(day).padStart(2, "0");
  const mm = String(month + 1).padStart(2, "0");
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dow = days[target.getDay()];

  if (diffDays === 0) return `Hôm nay (${dd}/${mm})`;
  if (diffDays === 1) return `Ngày mai (${dd}/${mm})`;
  if (diffDays === 2) return `Ngày kia (${dd}/${mm})`;
  return `${dow} (${dd}/${mm}/${year})`;
}

/**
 * Tính toán chính xác thời điểm bóng lăn (Kickoff Date) dựa trên cả NGÀY THÁNG NĂM + GIỜ PHÚT
 * Hỗ trợ truyền cả object { matchDate, matchDateIso, startTime, kickoffTime } hoặc tham số rời
 */
export function getMatchKickoffDate(
  matchOrDateStr:
    | string
    | {
        matchDate?: string;
        matchDateIso?: string;
        startTime?: string;
        kickoffTime?: string | null;
      } = "Hôm nay",
  startTimeStr = "19:00",
  kickoffIso?: string | null
): Date {
  let resolvedDateStr = "Hôm nay";
  let resolvedStartTime = startTimeStr;
  let resolvedKickoffIso = kickoffIso;

  if (typeof matchOrDateStr === "object" && matchOrDateStr !== null) {
    resolvedDateStr =
      matchOrDateStr.matchDateIso || matchOrDateStr.matchDate || "Hôm nay";
    resolvedStartTime = matchOrDateStr.startTime || "19:00";
    resolvedKickoffIso = matchOrDateStr.kickoffTime;
  } else if (typeof matchOrDateStr === "string") {
    resolvedDateStr = matchOrDateStr;
  }

  // Nếu có sẵn kickoffIso chuẩn từ DB và resolvedDateStr không chứa ngày cụ thể khác
  if (
    resolvedKickoffIso &&
    (!resolvedDateStr || resolvedDateStr === "Real-time")
  ) {
    const parsedIso = new Date(resolvedKickoffIso);
    if (!isNaN(parsedIso.getTime())) return parsedIso;
  }

  const { year, month, day } = parseMatchDateParts(resolvedDateStr);
  const { hour, minute } = parseStartTime(resolvedStartTime);

  return new Date(year, month, day, hour, minute, 0, 0);
}

/**
 * Tính thời điểm hết hạn của bài đăng tìm đối: ĐÚNG NGÀY THI ĐẤU + GIỜ BÓNG LĂN + 15 PHÚT
 * Ví dụ: Kèo 07:00 ngày 19/10/2026 -> Hết hạn lúc 07:15 ngày 19/10/2026
 */
export function getMatchExpiresDate(
  match: {
    expiresAt?: string | null;
    kickoffTime?: string | null;
    matchDate?: string;
    matchDateIso?: string;
    startTime?: string;
    createdAt?: string;
  },
  graceMinutes = 15
): Date {
  // 1. Nếu có sẵn expiresAt chuẩn ISO (VD: từ kèo test mô phỏng 5s hoặc từ DB)
  if (match.expiresAt) {
    const parsed = new Date(match.expiresAt);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // 2. Tính từ Ngày thi đấu (ưu tiên matchDateIso YYYY-MM-DD) + Giờ bắt đầu + 15 phút
  const kickoff = getMatchKickoffDate(
    match.matchDateIso || match.matchDate || "Hôm nay",
    match.startTime || "19:00",
    match.kickoffTime
  );

  return new Date(kickoff.getTime() + graceMinutes * 60 * 1000);
}

/**
 * Kiểm tra xem kèo mở có bị quá hạn (>15 phút sau giờ bóng lăn của ĐÚNG NGÀY ĐÓ) hay không
 */
export function isMatchExpired(
  match: {
    status?: string;
    expiresAt?: string | null;
    kickoffTime?: string | null;
    matchDate?: string;
    matchDateIso?: string;
    startTime?: string;
    createdAt?: string;
  },
  graceMinutesOrNow: number | Date = 15,
  currentTimestamp: number | Date = Date.now()
): boolean {
  if (match.status === "EXPIRED" || match.status === "CANCELLED") {
    return true;
  }

  if (
    match.status === "MATCHED" ||
    match.status === "PLAYING_VERIFIED" ||
    match.status === "FINISHED"
  ) {
    return false;
  }

  let graceMinutes = 15;
  let nowMs = Date.now();

  if (graceMinutesOrNow instanceof Date) {
    nowMs = graceMinutesOrNow.getTime();
    graceMinutes = typeof currentTimestamp === "number" && currentTimestamp < 1000 ? currentTimestamp : 15;
  } else if (typeof graceMinutesOrNow === "number" && graceMinutesOrNow > 100000) {
    nowMs = graceMinutesOrNow;
  } else {
    graceMinutes = graceMinutesOrNow;
    nowMs =
      currentTimestamp instanceof Date
        ? currentTimestamp.getTime()
        : currentTimestamp;
  }

  const expiryDate = getMatchExpiresDate(match, graceMinutes);
  return nowMs >= expiryDate.getTime();
}

/**
 * Trả về chuỗi giờ hết hạn (VD: "07:15" hoặc "19:15")
 */
export function formatExpiryTime(startTimeStr = "19:00", graceMinutes = 15): string {
  const { hour, minute } = parseStartTime(startTimeStr);
  const totalMinutes = hour * 60 + minute + graceMinutes;
  const expH = Math.floor(totalMinutes / 60) % 24;
  const expM = totalMinutes % 60;
  return `${expH.toString().padStart(2, "0")}:${expM.toString().padStart(2, "0")}`;
}

/**
 * Trả về chuỗi đầy đủ Giờ + Ngày tự động đóng bài (VD: "07:15 • Ngày mai (19/10)")
 */
export function formatFullExpiryLabel(
  startTimeStr = "19:00",
  matchDateStr?: string,
  graceMinutes = 15
): string {
  const timePart = formatExpiryTime(startTimeStr, graceMinutes);
  const datePart = formatMatchDateShort(matchDateStr);
  return `${timePart} • ${datePart}`;
}
