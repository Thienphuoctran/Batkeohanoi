/**
 * Tiện ích xử lý thời gian thi đấu & Cơ chế tự động dọn dẹp kèo quá hạn (15 phút sau bóng lăn)
 * Quy chuẩn: Nền tảng BắtKèo7 / GiaoHuu.vn Sân 7 Hà Nội
 */

import { MatchFeedItem } from "@/types/matchmaking";

/**
 * Trích xuất giờ và phút từ chuỗi ca giờ (VD: "19:00", "19:00 - 20:30", "19h30", "20:30")
 */
export function parseStartTime(timeStr: string): { hour: number; minute: number } {
  if (!timeStr) return { hour: 19, minute: 0 };

  // Lấy phần đầu nếu có dấu gạch ngang (VD: "19:00 - 20:30" -> "19:00")
  const firstPart = timeStr.split("-")[0].trim().toLowerCase();
  
  // Xử lý định dạng "19h30" hoặc "19h"
  if (firstPart.includes("h")) {
    const [h, m] = firstPart.split("h");
    return {
      hour: Math.min(23, Math.max(0, parseInt(h, 10) || 19)),
      minute: Math.min(59, Math.max(0, parseInt(m, 10) || 0)),
    };
  }

  // Xử lý định dạng "19:00"
  const parts = firstPart.split(":");
  return {
    hour: Math.min(23, Math.max(0, parseInt(parts[0], 10) || 19)),
    minute: Math.min(59, Math.max(0, parseInt(parts[1], 10) || 0)),
  };
}

/**
 * Tính toán thời điểm bóng lăn (Kickoff Date) dựa trên matchDate và startTime
 */
export function getMatchKickoffDate(
  matchDateStr = "Hôm nay",
  startTimeStr = "19:00",
  createdAtStr?: string
): Date {
  const now = new Date();
  const { hour, minute } = parseStartTime(startTimeStr);

  const kickoff = new Date(now);
  kickoff.setHours(hour, minute, 0, 0);

  // Nếu matchDateStr có định dạng YYYY-MM-DD
  if (matchDateStr && matchDateStr.includes("-") && matchDateStr.length >= 8) {
    const parsed = new Date(matchDateStr);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(hour, minute, 0, 0);
      return parsed;
    }
  }

  // Nếu matchDateStr có định dạng DD/MM/YYYY
  if (matchDateStr && matchDateStr.includes("/")) {
    const parts = matchDateStr.split("/");
    if (parts.length >= 2) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parts[2] ? parseInt(parts[2], 10) : now.getFullYear();
      const customDate = new Date(y, m, d, hour, minute, 0, 0);
      if (!isNaN(customDate.getTime())) return customDate;
    }
  }

  // Nếu là "Ngày mai"
  if (matchDateStr && matchDateStr.toLowerCase().includes("mai")) {
    kickoff.setDate(kickoff.getDate() + 1);
    return kickoff;
  }

  // Mặc định là ngày hôm nay
  return kickoff;
}

/**
 * Tính thời điểm hết hạn của bài đăng tìm đối (mặc định: Giờ bóng lăn + 15 phút)
 */
export function getMatchExpiresDate(
  match: {
    expiresAt?: string | null;
    matchDate?: string;
    startTime?: string;
    createdAt?: string;
  },
  graceMinutes = 15
): Date {
  // 1. Nếu đã có sẵn expiresAt từ server
  if (match.expiresAt) {
    const parsed = new Date(match.expiresAt);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // 2. Tự động tính: Kickoff Time + graceMinutes (15 phút)
  const kickoff = getMatchKickoffDate(
    match.matchDate || "Hôm nay",
    match.startTime || "19:00",
    match.createdAt
  );

  return new Date(kickoff.getTime() + graceMinutes * 60 * 1000);
}

/**
 * Kiểm tra xem kèo mở có bị quá hạn (>15 phút sau bóng lăn) hay không
 * QUY TẮC: Chỉ áp dụng dọn dẹp với kèo chưa có đối (OPEN hoặc SOS)
 * Kèo đã MATCHED / PLAYING_VERIFIED là trận đang diễn ra thực tế, không bị xóa
 */
export function isMatchExpired(
  match: {
    status?: string;
    expiresAt?: string | null;
    matchDate?: string;
    startTime?: string;
    createdAt?: string;
  },
  graceMinutes = 15,
  currentTimestamp = Date.now()
): boolean {
  // Trạng thái đã hết hạn hoặc đã hủy
  if (match.status === "EXPIRED" || match.status === "CANCELLED") {
    return true;
  }

  // Kèo đã ghép thành công không bị tự động xóa bởi cơ chế này
  if (
    match.status === "MATCHED" ||
    match.status === "PLAYING_VERIFIED" ||
    match.status === "FINISHED"
  ) {
    return false;
  }

  // Kiểm tra mốc thời gian hết hạn
  const expiryDate = getMatchExpiresDate(match, graceMinutes);
  return currentTimestamp >= expiryDate.getTime();
}

/**
 * Trả về chuỗi giờ hết hạn để hiển thị trực quan (VD: "19:15")
 */
export function formatExpiryTime(startTimeStr = "19:00", graceMinutes = 15): string {
  const { hour, minute } = parseStartTime(startTimeStr);
  const totalMinutes = hour * 60 + minute + graceMinutes;
  const expH = Math.floor(totalMinutes / 60) % 24;
  const expM = totalMinutes % 60;
  return `${expH.toString().padStart(2, "0")}:${expM.toString().padStart(2, "0")}`;
}
