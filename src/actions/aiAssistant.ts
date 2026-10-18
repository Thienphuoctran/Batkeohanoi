"use server";

import { HANOI_PITCHES } from "@/constants/hanoiPitches";
import { getZaloDeepLink } from "@/lib/zalo";

const SYSTEM_INSTRUCTION = `
Bạn là Trợ Lý AI Chuyên Sâu của nền tảng BắtKèo7 Hà Nội (BắtKèo7.vn) - Nền tảng ghép đối sân 7 và chống bùng kèo bóng đá phủi số 1 Hà Nội.
Bạn nói chuyện với phong cách anh em bóng đá phủi: chân thành, nhiệt huyết, súc tích, văn minh và chuẩn xác nghiệp vụ.

Các quy chế nghiệp vụ cốt lõi của BắtKèo7 Hà Nội:
1. Ký quỹ & Cọc 200.000đ cố định:
   - Đội bóng có điểm Uy Tín 100/100đ được miễn cọc tiền mặt.
   - Khi điểm Uy Tín dưới 70đ hoặc khi nhận kèo SOS giờ vàng: hệ thống tự động khóa bảo chứng 200.000đ trong ví.
   - Sau khi hoàn thành trận đấu và nhập Mã Bắt Tay 4 số trên sân, 200.000đ tự động nhả về ví khả dụng.
   - Rút tiền về ngân hàng: Bất cứ lúc nào trước 22h00 hàng ngày (BQT đối soát xử lý trong 5-15 phút qua VietQR Napas247).
2. Chống bùng kèo & đền bù tiền sân:
   - Đội bùng kèo (không đến sân hoặc hủy sát giờ <2h): Bị tịch thu 100% tiền cọc 200k + trừ -30đ đến -40đ Uy Tín (dưới 70đ bị khóa tạo kèo).
   - Đội bị bùng (đội nạn nhân có mặt tại sân): Nhận trọn vẹn 200.000đ tiền cọc của đội bùng để bù đắp chi phí thuê sân với chủ sân.
   - Xác thực qua: Mã Bắt Tay 4 số, Định vị GPS trong bán kính 300m quanh sân bóng, và SĐT đối chứng của Chủ sân.
3. Hộp Kháng Cáo Bất Khả Kháng (Giải Oan 100đ):
   - Khi hủy kèo do sự cố khách quan: Mưa ngập sân, hỏng dàn đèn, chủ sân thu hồi sân, tai nạn khẩn cấp...
   - Đội trưởng bấm "Hủy Kèo & Gửi Kháng Cáo", chọn lý do và điền SĐT chủ sân xác minh. BQT duyệt 1-chạm khôi phục 100đ Uy Tín và hoàn cọc 100%.
4. Phân hạng Tier phủi:
   - Tier 1: Dưỡng sinh, văn phòng, cấm xoạc bóng, cấm va chạm mạnh.
   - Tier 2: Phong trào cứng, có tranh chấp vừa phải.
   - Tier 3: Bán chuyên, cọ xát đỉnh cao.
5. Sân phủi Hà Nội: Các cụm sân nổi tiếng ở Cầu Giấy (Thành Phát, ĐH Thương Mại), Nam Từ Liêm (Mỹ Đình 1, Mễ Trì Hạ), Thanh Xuân (Đầm Hồng, Bộ Công An)...
6. Chợ Cầu Phủi: Có mục Chợ Cầu để tuyển người đá thay và thuê thủ môn (GK) theo vị trí và khung giờ.
7. Hotline Zalo Ban Quản Trị: 0744.094.832.

Quy định phản hồi: Trả lời ngắn gọn (dưới 150 từ), dùng biểu tượng cảm xúc thể thao, định dạng markdown có gạch đầu dòng rõ ràng.
`;

export interface ChatMessageItem {
  role: "user" | "assistant";
  text: string;
}

export interface AiAssistantResponse {
  success: boolean;
  reply: string;
  suggestedActions?: {
    label: string;
    actionType: "OPEN_WALLET" | "OPEN_PITCH_MAP" | "OPEN_SUB_MARKET" | "OPEN_ZALO" | "OPEN_SOS";
    payload?: string;
  }[];
}

// Bộ phân tích Offline AI Thông Minh dự phòng (Smart Fallback Engine)
function getSmartOfflineResponse(query: string): AiAssistantResponse {
  const q = query.toLowerCase();

  // 1. Hỏi về cọc 200k và rút tiền
  if (q.includes("cọc") || q.includes("rút tiền") || q.includes("200k") || q.includes("hoàn tiền") || q.includes("ví")) {
    return {
      success: true,
      reply: `🛡️ **Quy Chế Ký Quỹ & Cọc 200.000đ Cố Định tại BắtKèo7:**\n\n• **Mức cọc:** Cố định **200.000 VNĐ** (chỉ áp dụng khi điểm Uy Tín < 70đ hoặc bắt kèo SOS).\n• **Mở khóa cọc:** Ngay khi hai đội gặp nhau trên sân và nhập **Mã Bắt Tay 4 số**, 200k sẽ tự động nhả về số dư khả dụng.\n• **Rút tiền về ngân hàng:** Bạn có thể bấm lệnh rút bất cứ lúc nào trước **22h00** hàng ngày. BQT đối soát chuyển khoản qua VietQR Napas247 trong **5-15 phút**!`,
      suggestedActions: [
        { label: "💼 Mở Ví Ký Quỹ & Rút Tiền", actionType: "OPEN_WALLET" },
        { label: "💬 Chat Zalo BQT Hỗ Trợ Rút", actionType: "OPEN_ZALO" },
      ],
    };
  }

  // 2. Hỏi về bùng kèo và bồi thường
  if (q.includes("bùng") || q.includes("đền") || q.includes("bồi thường") || q.includes("không đến") || q.includes("quịt")) {
    return {
      success: true,
      reply: `⚠️ **Cơ Chế Chống Bùng Kèo & Đền Bù Tiền Sân:**\n\n• **Đội bùng kèo:** Bị tịch thu toàn bộ **200.000đ** cọc + trừ **-30 đến -40 điểm Uy Tín** (bị khóa quyền bắt đối mới).\n• **Đội bị bùng (đến sân đúng giờ):** Được nhận trọn vẹn **200.000đ tiền đền bù** để bù chi phí thuê sân với ban quản lý sân cỏ!\n• **Cách xác thực:** Đội trưởng bấm *"Báo Đối Thủ Bùng Kèo"*, hệ thống kiểm tra GPS tại sân (<300m) và BQT gọi hotline chủ sân đối chứng.`,
      suggestedActions: [
        { label: "🚨 Xem Kèo Cứu Hộ SOS", actionType: "OPEN_SOS" },
        { label: "💬 Báo Bùng Kèo Qua Zalo BQT", actionType: "OPEN_ZALO" },
      ],
    };
  }

  // 3. Hỏi về thời tiết, mưa bão, hủy kèo, kháng cáo
  if (q.includes("mưa") || q.includes("hủy") || q.includes("kháng cáo") || q.includes("sự cố") || q.includes("dàn đèn") || q.includes("ngập")) {
    return {
      success: true,
      reply: `🌧️ **Hủy Kèo Bất Khả Kháng (Kháng Cáo 1-Chạm Giữ 100đ):**\n\n• Nếu mưa ngập sân, hỏng dàn đèn hoặc chủ sân thu hồi sân đột xuất, bạn **KHÔNG BỊ PHẠT** nếu gửi kháng cáo hợp lệ.\n• **Cách thao tác:** Bấm *"Hủy Kèo"* ➔ Chọn *"Gửi Kháng Cáo Bất Khả Kháng"* ➔ Chọn nguyên nhân & điền SĐT chủ sân xác nhận.\n• BQT sẽ xét duyệt 1-chạm tại Admin Hub để **khôi phục ngay 100 điểm Uy Tín** và bảo lưu tiền cọc cho đội bạn!`,
      suggestedActions: [
        { label: "💬 Gửi Kháng Cáo Qua Zalo BQT", actionType: "OPEN_ZALO" },
      ],
    };
  }

  // 4. Hỏi về thủ môn, chợ cầu, người đá thay
  if (q.includes("thủ môn") || q.includes("gk") || q.includes("đá thay") || q.includes("chợ cầu") || q.includes("thiếu người") || q.includes("bắt gôn")) {
    return {
      success: true,
      reply: `🧤 **Chợ Cầu Phủi & Thuê Thủ Môn (GK) Hà Nội:**\n\n• Bạn có thể vào tab **"Chợ Cầu"** để xem danh sách các cầu thủ tự do (Free Agent) và thủ môn có Thẻ Căn Cước Bóng Đá Số.\n• Lọc theo Quận (Cầu Giấy, Nam Từ Liêm, Thanh Xuân...) và khung giờ (17h30, 19h00, 20h30).\n• Nhắn tin Zalo trực tiếp 1-chạm với cầu thủ để thỏa thuận màu áo và tiền nước!`,
      suggestedActions: [
        { label: "🧤 Vào Chợ Cầu Phủi", actionType: "OPEN_SUB_MARKET" },
      ],
    };
  }

  // 5. Hỏi về sân bóng và địa chỉ
  if (q.includes("sân") || q.includes("cầu giấy") || q.includes("thanh xuân") || q.includes("mỹ đình") || q.includes("địa chỉ") || q.includes("ở đâu")) {
    const list = HANOI_PITCHES.slice(0, 3)
      .map((p) => `• **${p.name}** (${p.district}): ${p.address}`)
      .join("\n");
    return {
      success: true,
      reply: `🏟️ **Cụm Sân Cỏ Nhân Tạo Hà Nội Tiêu Chuẩn:**\n\n${list}\n\nBạn có thể vào mục **"Bản Đồ"** trên thanh điều hướng để xem vị trí toạ độ, chất lượng cỏ và radar thời tiết từng cụm sân!`,
      suggestedActions: [
        { label: "🗺️ Mở Bản Đồ Sân Phủi", actionType: "OPEN_PITCH_MAP" },
      ],
    };
  }

  // 6. Hỏi về liên hệ Zalo, hotline
  if (q.includes("zalo") || q.includes("hotline") || q.includes("liên hệ") || q.includes("admin") || q.includes("sđt") || q.includes("gặp")) {
    return {
      success: true,
      reply: `📞 **Kênh Hỗ Trợ Khách Hàng Trực Tiếp Zalo BQT:**\n\n• **Hotline / Zalo Trực Ban:** \`0744.094.832\` (hoặc bấm nút bên dưới để mở thẳng ứng dụng Zalo).\n• **Thời gian hỗ trợ:** 24/7 (Đặc biệt túc trực trong các khung giờ vàng 17h30 - 22h00 để hỗ trợ ghép đối và giải quyết khiếu nại sân).`,
      suggestedActions: [
        { label: "💬 Mở Zalo Ban Quản Trị Ngay", actionType: "OPEN_ZALO" },
      ],
    };
  }

  // 7. Mặc định
  return {
    success: true,
    reply: `⚽ **BắtKèo7 AI Assistant xin chào anh em!**\n\nTôi có thể giải đáp ngay mọi thắc mắc của bạn về:\n• 🛡️ **Ví Ký Quỹ & Cọc 200k** (cách nạp, rút trước 22h00)\n• ⚠️ **Cơ chế đền bù 200k khi đối thủ bùng kèo**\n• 🌧️ **Kháng cáo hủy kèo do mưa bão, hỏng dàn đèn**\n• 🧤 **Chợ Cầu tìm thủ môn (GK) & lính đánh thuê**\n• 🏟️ **Tìm sân bóng cỏ nhân tạo đẹp theo quận**\n\nBạn hãy bấm vào các gợi ý bên dưới hoặc gõ câu hỏi nhé!`,
    suggestedActions: [
      { label: "🛡️ Cọc 200k rút thế nào?", actionType: "OPEN_WALLET" },
      { label: "⚠️ Bị bùng kèo ai đền tiền?", actionType: "OPEN_SOS" },
      { label: "💬 Chat Trực Tiếp Zalo BQT", actionType: "OPEN_ZALO" },
    ],
  };
}

export async function askBatKeoAiAssistantAction(payload: {
  question: string;
  history?: ChatMessageItem[];
}): Promise<AiAssistantResponse> {
  const userQuestion = payload.question?.trim() || "";
  if (!userQuestion) {
    return {
      success: false,
      reply: "Vui lòng nhập câu hỏi để Trợ Lý AI giải đáp cho bạn nhé!",
    };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  // Nếu có cấu hình GEMINI_API_KEY, gọi mô hình Gemini 1.5 Flash
  if (geminiApiKey) {
    try {
      const contents = [];

      // Lịch sử trò chuyện gần nhất (tối đa 4 lượt)
      if (payload.history && Array.isArray(payload.history)) {
        for (const item of payload.history.slice(-4)) {
          contents.push({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.text }],
          });
        }
      }

      contents.push({
        role: "user",
        parts: [{ text: userQuestion }],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && typeof candidateText === "string") {
          return {
            success: true,
            reply: candidateText.trim(),
            suggestedActions: [
              { label: "💬 Chat Zalo Với BQT", actionType: "OPEN_ZALO" },
              { label: "💼 Mở Ví Ký Quỹ", actionType: "OPEN_WALLET" },
            ],
          };
        }
      }
    } catch (err) {
      console.warn("[Gemini AI Error - Fallback to Smart Engine]", err);
    }
  }

  // Fallback an toàn và tức thì: Dùng Offline Knowledge Engine
  return getSmartOfflineResponse(userQuestion);
}
