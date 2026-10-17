/**
 * Telegram & Zalo Webhook Alert Engine for Football Matchmaking
 * Bot: @BatKeo7_AlertBot (Hà Nội v2.0)
 */

export interface TelegramNotificationPayload {
  type: "SOS_BROADCAST" | "MATCH_LOCKED" | "MATCH_CREATED" | "PENALTY_ALERT" | "REVIEW_UNLOCKED";
  title: string;
  matchId?: string;
  teamName: string;
  opponentName?: string;
  pitchName: string;
  timeSlot: string;
  district: string;
  tierName: string;
  phoneContact: string;
  details?: string;
}

export class TelegramBotService {
  private static BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "MOCK_TOKEN_BATKEO7";
  private static CHAT_ID = process.env.TELEGRAM_CHAT_ID || "@batkeo7_hanoi_feed";

  /**
   * Định dạng tin nhắn chuẩn HTML cho Telegram
   */
  public static formatHtmlMessage(payload: TelegramNotificationPayload): string {
    const timestamp = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    switch (payload.type) {
      case "SOS_BROADCAST":
        return `
🚨 <b>[KÈO CỨU HỘ SOS &lt; 2H] — ${payload.district.toUpperCase()}</b>
⚽ <b>Đội bóng:</b> ${payload.teamName} (${payload.tierName})
📍 <b>Cụm sân:</b> ${payload.pitchName}
⏰ <b>Giờ bóng lăn:</b> ${payload.timeSlot} (Hôm nay)
💰 <b>Ưu đãi cứu hộ:</b> Giảm ngay 125.000đ tiền sân + Bao nước
📞 <b>Liên hệ bắt đối:</b> <code>${payload.phoneContact}</code>
<i>Thời gian phát tín hiệu: ${timestamp} • @BatKeo7_AlertBot</i>
        `.trim();

      case "MATCH_LOCKED":
        return `
⚡ <b>[ĐÃ KHÓA KÈO THÀNH CÔNG]</b>
🤝 <b>Trận đấu:</b> ${payload.teamName} ⚔️ ${payload.opponentName || "Đối thủ"}
📍 <b>Sân đấu:</b> ${payload.pitchName} (${payload.district})
⏰ <b>Thời gian:</b> ${payload.timeSlot}
🔒 <b>Trạng thái:</b> Khóa hàng Row-Level Lock • Chống trùng lịch
<i>Hệ thống tự động kích hoạt Đánh giá mù sau trận đấu.</i>
        `.trim();

      case "PENALTY_ALERT":
        return `
⚠️ <b>[CẢNH BÁO VI PHẠM TÍN NHIỆM]</b>
🚩 <b>Đội bóng:</b> ${payload.teamName}
📌 <b>Lý do:</b> ${payload.details || "Bùng kèo sát giờ < 1 tiếng"}
🛡️ <b>Chế tài áp dụng:</b> Gắn nhãn đỏ công khai • Bắt buộc cọc 100% khi nhận kèo
<i>Hệ thống giám sát fair-play BắtKèo7.vn</i>
        `.trim();

      default:
        return `
📢 <b>[BẮTKÈO7.VN THÔNG BÁO] — ${payload.title}</b>
⚽ <b>Đội:</b> ${payload.teamName} | 📍 ${payload.pitchName} (${payload.timeSlot})
<i>Cập nhật lúc: ${timestamp}</i>
        `.trim();
    }
  }

  /**
   * Gửi bản tin qua Telegram Bot API (với fallback mock console an toàn)
   */
  public static async sendAlert(payload: TelegramNotificationPayload): Promise<{ success: boolean; messageId?: string }> {
    const text = this.formatHtmlMessage(payload);

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://batkeo7.vn";
      const replyMarkup = {
        inline_keyboard: [
          [
            {
              text: payload.type === "SOS_BROADCAST" ? "🚨 Vào Giải Cứu Kèo Ngay" : "⚽ Mở App Bắt Kèo Sân 7",
              url: appUrl,
            },
          ],
        ],
      };

      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== "MOCK_TOKEN_BATKEO7") {
        const response = await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: this.CHAT_ID,
            text,
            parse_mode: "HTML",
            reply_markup: replyMarkup,
          }),
        });
        const data = await response.json();
        return { success: data.ok, messageId: data.result?.message_id?.toString() };
      }


      // Giả lập log khi đang dev hoặc chưa có key
      console.log("[TelegramBotService Mock]", {
        type: payload.type,
        to: this.CHAT_ID,
        preview: text.slice(0, 100),
      });

      return { success: true, messageId: `mock-msg-${Date.now()}` };
    } catch (error) {
      console.error("[TelegramBotService Error]", error);
      return { success: false };
    }
  }
}
