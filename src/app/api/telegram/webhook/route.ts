import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { TelegramBotService } from "@/services/telegramBotService";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://batkeo7.vn";

async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: Record<string, unknown>
) {
  if (!TELEGRAM_TOKEN) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
      disable_web_page_preview: true,
    }),
  });
}

async function handleSosQuery(chatId: number | string) {
  const supabase = getAdminClient();
  const { data: sosMatches } = await supabase
    .from("matches")
    .select("*, teams:host_team_id(team_name, trust_score)")
    .eq("status", "open")
    .eq("is_sos", true)
    .limit(3);

  if (!sosMatches || sosMatches.length === 0) {
    await sendTelegramMessage(
      chatId,
      "Hiện không có kèo SOS nào cần cứu hộ tại Cầu Giấy & Nam Từ Liêm. Mọi trận đấu đang diễn ra ổn định!"
    );
    return;
  }

  let sosMsg = `🚨 <b>DANH SÁCH KÈO CỨU HỘ PHÚT CHÓT (SOS):</b>\n\n`;
  sosMatches.forEach((m: any, idx: number) => {
    sosMsg +=
      `<b>${idx + 1}. ${m.teams?.team_name || "Đội chủ sân"}</b> (Tín nhiệm: ${
        m.teams?.trust_score ?? 100
      }/100)\n` +
      `• Sân: ${m.pitch_custom_name} (${m.district})\n` +
      `• Giờ: ${m.time_slot_label}\n` +
      `• Tiền sân chỉ góp: <b>${Number(
        m.split_fee || 350000
      ).toLocaleString()}đ</b> (${m.subsidy_notes || "Có hỗ trợ"})\n` +
      `👉 <a href="${APP_URL}?match_id=${m.id}">Bấm vào đây để cứu kèo ngay</a>\n\n`;
  });

  await sendTelegramMessage(chatId, sosMsg);
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Hỗ trợ gọi trực tiếp từ nút Test trên Web UI
    if (update.alertPayload) {
      const sent = await TelegramBotService.sendAlert(update.alertPayload);
      return NextResponse.json({ ok: sent.success, messageId: sent.messageId });
    }

    // 1. Xử lý tin nhắn văn bản / lệnh từ Telegram
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();
      const userName = update.message.from?.first_name || "Đội trưởng";

      // Lệnh /start
      if (text.startsWith("/start")) {
        const welcomeText =
          `👋 <b>Chào mừng ${userName} đến với BắtKèo7 Alert!</b>\n\n` +
          `Hệ sinh thái ghép trận bóng đá sân 7 văn minh tại Cầu Giấy & Nam Từ Liêm.\n\n` +
          `⚡ <b>Các lệnh nhanh:</b>\n` +
          `• <code>/keo</code> : Xem các kèo đang mở tìm đối hôm nay\n` +
          `• <code>/sos</code> : Xem kèo cứu hộ phút chót (trợ giá 100k–150k)\n` +
          `• <code>/rules</code> : Xem quy chuẩn chế tài bùng kèo & tín nhiệm\n` +
          `• <code>/id</code> : Lấy Chat ID của bạn để cấu hình nhận thông báo riêng`;

        const canUseWebApp = APP_URL.startsWith("https://");
        await sendTelegramMessage(chatId, welcomeText, {
          inline_keyboard: [
            canUseWebApp
              ? [{ text: "🌐 Mở Web App BắtKèo7", web_app: { url: APP_URL } }]
              : [{ text: "🔥 Xem Danh Sách Kèo Mở", callback_data: "cmd_keo" }],
            [{ text: "🔥 Xem Kèo SOS Gấp", callback_data: "cmd_sos" }],
          ],
        });
        return NextResponse.json({ ok: true });
      }

      // Lệnh /id
      if (text === "/id") {
        await sendTelegramMessage(
          chatId,
          `🆔 <b>Chat ID của bạn:</b> <code>${chatId}</code>\n<i>Sao chép mã này vào hồ sơ đội bóng trên Web để nhận tin báo riêng.</i>`
        );
        return NextResponse.json({ ok: true });
      }

      // Lệnh /rules
      if (text === "/rules") {
        const rulesMsg =
          `🛡️ <b>QUY CHUẨN CHẾ TÀI BÙNG KÈO &amp; TÍN NHIỆM BẮTKÈO7:</b>\n\n` +
          `• <b>Mặc định:</b> Mỗi đội khởi đầu với <b>100 điểm tín nhiệm</b> (Miễn cọc tiền mặt).\n` +
          `• <b>Hủy trước &gt; 4 tiếng:</b> Hợp lệ (Không trừ điểm).\n` +
          `• <b>Hủy từ 1h – 4h trước trận:</b> Trừ <b>-5 điểm</b>, tự đẩy vào Trạm Cứu Hộ SOS.\n` +
          `• <b>Hủy sát giờ (&lt; 1 tiếng) Lần 1:</b> Trừ <b>-20 điểm</b> + Nhắc nhở nội bộ.\n` +
          `• <b>Hủy sát giờ (&lt; 1 tiếng) Lần 2+:</b> Trừ <b>-35 điểm</b> + Gắn nhãn công khai <i>"⚠️ Từng bùng kèo"</i>.\n` +
          `• <b>Ký quỹ bắt buộc (&lt; 70 điểm):</b> Phải nạp cọc giữ chân <b>200.000 VNĐ</b> qua VietQR Ban Quản Trị (MB Bank: <code>07440948327598</code> - TRAN QUOC THIEN PHUOC) trước khi tạo hoặc bắt kèo.\n` +
          `• <b>Cơ chế xóa nhãn:</b> Đá đủ <b>5 trận văn minh liên tiếp</b> được đánh giá 5★ sẽ tự động gỡ nhãn cảnh báo!`;
        await sendTelegramMessage(chatId, rulesMsg);
        return NextResponse.json({ ok: true });
      }

      // Lệnh /sos: Truy vấn các kèo cứu hộ khẩn cấp
      if (text === "/sos" || text === "cmd_sos") {
        await handleSosQuery(chatId);
        return NextResponse.json({ ok: true });
      }

      // Lệnh /keo: Truy vấn các kèo mở
      if (text === "/keo") {
        const supabase = getAdminClient();
        const { data: openMatches } = await supabase
          .from("matches")
          .select("*, teams:host_team_id(team_name, trust_score)")
          .eq("status", "open")
          .eq("is_sos", false)
          .order("kickoff_time", { ascending: true })
          .limit(5);

        if (!openMatches || openMatches.length === 0) {
          await sendTelegramMessage(
            chatId,
            "Hiện chưa có kèo mở mới. Bạn hãy bấm vào Web để tạo kèo phát sóng cho các đội khác nhé!"
          );
          return NextResponse.json({ ok: true });
        }

        let msg = `⚽ <b>CÁC KÈO ĐẤU ĐANG CHỜ BẮT ĐỐI HÔM NAY:</b>\n\n`;
        openMatches.forEach((m: any, idx: number) => {
          msg +=
            `<b>${idx + 1}. ${m.teams?.team_name || "Đội chủ sân"}</b>\n` +
            `• Địa điểm: ${m.pitch_custom_name} (${m.district})\n` +
            `• Giờ: ${m.time_slot_label} | Chia 50/50: ${Number(
              m.split_fee || 350000
            ).toLocaleString()}đ\n` +
            `• Ghi chú: ${m.notes || "Giao lưu văn minh"}\n\n`;
        });

        const canUseWebApp = APP_URL.startsWith("https://");
        await sendTelegramMessage(
          chatId,
          msg,
          canUseWebApp
            ? {
                inline_keyboard: [
                  [{ text: "⚽ Mở Bảng Tin Kèo Đấu", web_app: { url: APP_URL } }],
                ],
              }
            : undefined
        );
        return NextResponse.json({ ok: true });
      }
    }

    // 2. Xử lý Callback Query (khi bấm nút inline)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const callbackChatId = update.callback_query.message.chat.id;

      if (callbackData === "cmd_sos") {
        await sendTelegramMessage(
          callbackChatId,
          "Đang tải danh sách kèo cứu hộ..."
        );
        await handleSosQuery(callbackChatId);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook Error]", error);
    return NextResponse.json(
      { ok: false, error: "Internal Error" },
      { status: 500 }
    );
  }
}
