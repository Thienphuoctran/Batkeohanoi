/**
 * Bộ tạo & kiểm tra Dấu vân tay thiết bị bền vững (Persistent Device Fingerprinting)
 * Dành cho Nền tảng BắtKèo7 - Khóa chặt tình trạng lập nick ảo (Anti-Smurf)
 * Không làm phiền người dùng, chạy ngầm 100% trong 50ms.
 */

// Hàm băm chuỗi ký tự thành mã hash hex ngắn gọn (Murmur/DJB2 hash)
function hashString(str: string): string {
  let hash1 = 5381;
  let hash2 = 52711;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 * 33) ^ char;
  }

  const h = (hash1 >>> 0) * 4096 + (hash2 >>> 0);
  return h.toString(16).toUpperCase().padStart(12, "0").slice(0, 12);
}

/**
 * Trích xuất GPU Renderer qua WebGL Context (không yêu cầu quyền hạn từ user)
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) return "NO_WEBGL";

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "NO_DEBUG_INFO";

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "";
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";

    return `${vendor}~${renderer}`;
  } catch {
    return "WEBGL_ERR";
  }
}

/**
 * Trích xuất dấu vết vẽ Canvas 2D
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "NO_CANVAS_2D";

    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial', sans-serif";
    ctx.fillStyle = "#10b981";
    ctx.fillRect(10, 10, 180, 30);
    ctx.fillStyle = "#0B1120";
    ctx.fillText("BatKeo7-AntiSmurf-2026", 15, 18);

    return hashString(canvas.toDataURL());
  } catch {
    return "CANVAS_ERR";
  }
}

/**
 * Tính toán mã Dấu vân tay thiết bị bền vững duy nhất
 * Kết hợp: Độ phân giải màn hình + GPU + Canvas + CPU Cores + Timezone
 */
export async function getPersistentDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") {
    return "SERVER_ENV";
  }

  // 1. Kiểm tra cache đã lưu để tăng tốc độ phản hồi
  try {
    const cached = localStorage.getItem("bk7_device_fp");
    if (cached && cached.startsWith("BK7-")) {
      return cached;
    }
  } catch {}

  try {
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}@${window.devicePixelRatio || 1}`;
    const cpuCores = navigator.hardwareConcurrency || 4;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Bangkok";
    const language = navigator.language || "vi";
    const webgl = getWebGLFingerprint();
    const canvasHash = getCanvasFingerprint();

    const rawSignal = [screenInfo, cpuCores, timezone, language, webgl, canvasHash].join("###");
    const rawHash = hashString(rawSignal);
    const finalFingerprint = `BK7-${rawHash}`;

    // Lưu vào LocalStorage để tái sử dụng
    try {
      localStorage.setItem("bk7_device_fp", finalFingerprint);
    } catch {}

    return finalFingerprint;
  } catch (err) {
    console.warn("[getPersistentDeviceFingerprint Fallback]", err);
    return `BK7-FALLBACK-${Date.now().toString(16)}`;
  }
}

/**
 * Đánh dấu thiết bị vừa dính vi phạm bùng kèo / bị trừ điểm < 70
 */
export function markDeviceAsPenalized(teamName: string, reason: string): void {
  if (typeof window === "undefined") return;

  try {
    getPersistentDeviceFingerprint().then((fp) => {
      const records = JSON.parse(localStorage.getItem("bk7_penalized_history") || "[]");
      records.push({
        fingerprint: fp,
        teamName,
        reason,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("bk7_penalized_history", JSON.stringify(records));
      localStorage.setItem("bk7_is_probation_device", "true");
    });
  } catch (err) {
    console.error("[markDeviceAsPenalized Error]", err);
  }
}

/**
 * Kiểm tra xem thiết bị hiện tại có đang trong diện nghi vấn / từng bị phạt không
 */
export function isCurrentDeviceSuspicious(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const flag = localStorage.getItem("bk7_is_probation_device");
    if (flag === "true") return true;

    const records = JSON.parse(localStorage.getItem("bk7_penalized_history") || "[]");
    return records.length > 0;
  } catch {
    return false;
  }
}
