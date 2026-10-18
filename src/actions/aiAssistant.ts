"use server";

import { HANOI_PITCHES } from "@/constants/hanoiPitches";
import { getZaloDeepLink } from "@/lib/zalo";

const SYSTEM_INSTRUCTION = `
Bạn là Trợ Lý AI Chuyên Sâu của nền tảng GiaoHuu.vn (giaohuu.vn) - Nền tảng ghép đối sân 7 và chống bùng kèo bóng đá phủi số 1 Hà Nội.
Bạn nói chuyện với phong cách anh em bóng đá phủi: chân thành, nhiệt huyết, am hiểu luật bóng đá sân 7, chiến thuật và nghiệp vụ nền tảng.

Các quy chế nghiệp vụ cốt lõi của GiaoHuu.vn Hà Nội:
1. Ký quỹ & Cọc 200.000đ cố định:
   - Đội bóng có điểm Uy Tín 100/100đ được miễn cọc tiền mặt.
   - Khi điểm Uy Tín dưới 70đ hoặc khi nhận kèo SOS giờ vàng: hệ thống tự động khóa bảo chứng 200.000đ trong ví.
   - Sau khi hoàn thành trận đấu và nhập Mã Bắt Tay 4 số trên sân, 200.000đ tự động nhả về ví khả dụng.
   - Rút tiền về ngân hàng: Bất cứ lúc nào trước 22h00 hàng ngày (BQT đối soát xử lý trong 5-15 phút qua VietQR Napas247).
2. Chống bùng kèo & đền bù tiền sân:
   - Đội bùng kèo (không đến sân hoặc hủy sát giờ <1h): Bị tịch thu 100% tiền cọc 200k + trừ -30đ đến -40đ Uy Tín (dưới 70đ bị khóa tạo kèo). Hủy hợp lệ phải báo trước ít nhất 1 tiếng.
   - Đội bị bùng (đội nạn nhân có mặt tại sân): Nhận trọn vẹn 200.000đ tiền cọc của đội bùng để bù đắp chi phí thuê sân với chủ sân.
   - Xác thực qua: Mã Bắt Tay 4 số, Định vị GPS trong bán kính 300m quanh sân bóng, và SĐT đối chứng của Chủ sân.
3. Hộp Kháng Cáo Bất Khả Kháng (Giải Oan 100đ):
   - Khi hủy kèo do sự cố khách quan: Mưa ngập sân, hỏng dàn đèn, chủ sân thu hồi sân, tai nạn khẩn cấp...
   - Đội trưởng bấm "Hủy Kèo & Gửi Kháng Cáo", chọn lý do và điền SĐT chủ sân xác minh. BQT duyệt 1-chạm khôi phục 100đ Uy Tín và hoàn cọc 100%.
4. Phân hạng Tier phủi:
   - Tier 1: Dưỡng sinh, văn phòng, cấm xoạc bóng, cấm va chạm mạnh.
   - Tier 2: Phong trào cứng, có tranh chấp vừa phải.
   - Tier 3: Bán chuyên, cọ xát đỉnh cao.
5. Sân phủi Hà Nội: Các cụm sân nổi tiếng ở Cầu Giấy, Nam Từ Liêm, Thanh Xuân, Đống Đa, Ba Đình, Hoàng Mai...
6. Chợ Cầu Phủi: Có mục Chợ Cầu để tuyển người đá thay và thuê thủ môn (GK) theo vị trí và khung giờ.
7. Hotline Zalo Ban Quản Trị: 0393.407.855.

Quy định phản hồi: Trả lời ngắn gọn (dưới 160 từ), phong cách thể thao nhiệt huyết, định dạng markdown có gạch đầu dòng rõ ràng.
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

// Bộ phân tích Offline AI Thông Minh dự phòng (Supercharged Offline Knowledge Engine - 25+ Topics)
function getSmartOfflineResponse(query: string): AiAssistantResponse {
  const q = query.toLowerCase().trim();

  // 1. Cọc 200k, rút tiền, nạp ví, ví ký quỹ
  if (
    q.includes("cọc") ||
    q.includes("rút tiền") ||
    q.includes("200k") ||
    q.includes("hoàn tiền") ||
    q.includes("ví") ||
    q.includes("nạp tiền") ||
    q.includes("ký quỹ")
  ) {
    return {
      success: true,
      reply: `🛡️ **Quy Chế Ký Quỹ & Cọc 200.000đ Cố Định:**\n\n• **Mức cọc:** Cố định **200.000 VNĐ** (chỉ áp dụng khi điểm Uy Tín < 70đ hoặc bắt kèo SOS).\n• **Mở khóa cọc:** Ngay khi hai đội gặp nhau trên sân và nhập **Mã Bắt Tay 4 số**, 200k tự động nhả về số dư ví khả dụng.\n• **Rút tiền về ngân hàng:** Bạn bấm lệnh rút bất kỳ lúc nào trước **22h00** hàng ngày. BQT đối soát chuyển khoản qua VietQR Napas247 trong **5-15 phút**!`,
      suggestedActions: [
        { label: "💼 Mở Ví Ký Quỹ & Rút Tiền", actionType: "OPEN_WALLET" },
        { label: "💬 Chat Zalo BQT Hỗ Trợ Rút", actionType: "OPEN_ZALO" },
      ],
    };
  }

  // 2. Bùng kèo, đối thủ hủy sát giờ, bồi thường tiền sân
  if (
    q.includes("bùng") ||
    q.includes("đền") ||
    q.includes("bồi thường") ||
    q.includes("không đến") ||
    q.includes("quịt") ||
    q.includes("hủy sát giờ")
  ) {
    return {
      success: true,
      reply: `⚠️ **Cơ Chế Chống Bùng Kèo & Đền Bù Tiền Sân:**\n\n• **Đội bùng kèo:** Bị tịch thu toàn bộ **200.000đ** cọc + trừ **-30 đến -40 điểm Uy Tín** (dưới 70đ bị khóa quyền tạo kèo).\n• **Đội bị bùng (đến sân đúng giờ):** Được nhận trọn vẹn **200.000đ tiền đền bù** để bù chi phí thuê sân với ban quản lý sân!\n• **Cách xác thực:** Đội trưởng bấm *"Báo Đối Thủ Bùng Kèo"*, hệ thống kiểm tra GPS tại sân (<300m) và BQT gọi hotline chủ sân đối chứng.`,
      suggestedActions: [
        { label: "🚨 Xem Kèo Cứu Hộ SOS", actionType: "OPEN_SOS" },
        { label: "💬 Báo Bùng Kèo Qua Zalo BQT", actionType: "OPEN_ZALO" },
      ],
    };
  }

  // 3. Mưa bão, thời tiết, ngập sân, hỏng dàn đèn, kháng cáo bất khả kháng
  if (
    q.includes("mưa") ||
    q.includes("bão") ||
    q.includes("hủy") ||
    q.includes("kháng cáo") ||
    q.includes("sự cố") ||
    q.includes("dàn đèn") ||
    q.includes("ngập") ||
    q.includes("thời tiết")
  ) {
    return {
      success: true,
      reply: `🌧️ **Hủy Kèo Bất Khả Kháng (Kháng Cáo 1-Chạm Giữ 100đ):**\n\n• Nếu gặp mưa to ngập sân, hỏng dàn đèn hoặc chủ sân thu hồi sân đột xuất, bạn **KHÔNG BỊ PHẠT** nếu gửi kháng cáo hợp lệ.\n• **Cách thao tác:** Bấm *"Hủy Kèo"* ➔ Chọn *"Gửi Kháng Cáo Bất Khả Kháng"* ➔ Chọn nguyên nhân & điền SĐT chủ sân xác nhận.\n• BQT xét duyệt 1-chạm tại Admin Hub để **khôi phục ngay 100 điểm Uy Tín** và bảo lưu tiền cọc cho đội bạn!`,
      suggestedActions: [
        { label: "💬 Gửi Kháng Cáo Qua Zalo BQT", actionType: "OPEN_ZALO" },
      ],
    };
  }

  // 4. Thủ môn (GK), người bắt gôn, thuê thủ môn, găng tay
  if (
    q.includes("thủ môn") ||
    q.includes("gk") ||
    q.includes("gôn") ||
    q.includes("bắt gôn") ||
    q.includes("găng tay") ||
    q.includes("thuê thủ môn")
  ) {
    return {
      success: true,
      reply: `🧤 **Thuê Thủ Môn (GK) Phủi & Chợ Cầu Hà Nội:**\n\n• **Chợ Cầu Phủi:** Vào tab **"Chợ Cầu"** để xem danh sách các GK tự do có Thẻ Căn Cước Bóng Đá Số.\n• **Giá thuê thông thường:** Dao động từ **100k - 200k/trận** (kèm tiền nước/trà đá).\n• **Lọc theo quận:** Tìm thủ môn theo Cầu Giấy, Nam Từ Liêm, Thanh Xuân... và kết nối Zalo 1-chạm trao đổi ngay!`,
      suggestedActions: [
        { label: "🧤 Vào Chợ Cầu Tìm Thủ Môn", actionType: "OPEN_SUB_MARKET" },
        { label: "💬 Nhờ BQT Ghép GK Khẩn Cấp", actionType: "OPEN_ZALO" },
      ],
    };
  }

  // 5. Chợ cầu, tìm người đá thay, lính đánh thuê, thiếu người
  if (
    q.includes("chợ cầu") ||
    q.includes("đá thay") ||
    q.includes("thiếu người") ||
    q.includes("lính đánh thuê") ||
    q.includes("tuyển người") ||
    q.includes("cần người")
  ) {
    return {
      success: true,
      reply: `👥 **Chợ Cầu GiaoHuu.vn - Cứu Tinh Khi Thiếu Quân:**\n\n• Nơi quy tụ hàng trăm cầu thủ phong trào tự do (Free Agents) sẵn sàng xỏ giày đá thay.\n• Bạn có thể lọc danh sách theo **Vị Trí** (Hậu vệ cánh, Thòng, Tiền vệ, Tiền đạo) và **Quận/Huyện**.\n• Bấm xem thông tin, phong cách thi đấu và mở Zalo chốt giờ hẹn với cầu thủ trong 30 giây!`,
      suggestedActions: [
        { label: "👥 Vào Chợ Cầu Tuyển Quân", actionType: "OPEN_SUB_MARKET" },
      ],
    };
  }

  // 6. Luật sân 7: Có việt vị không?
  if (q.includes("việt vị") || q.includes("offside")) {
    return {
      success: true,
      reply: `⚽ **Luật Việt Vị Trên Sân 7 Phủi Hà Nội:**\n\n• Theo luật bóng đá sân 7 VFF và phong trào Hà Nội: **HOÀN TOÀN KHÔNG BẮT VIỆT VỊ**!\n• Tiền đạo được phép đứng cắm sâu trong vòng cấm đối phương để đón bóng dài, tì đè và dứt điểm.\n• **Mẹo chiến thuật:** Hãy phân công 1 trung vệ "Thòng quét" kèm sát tiền đạo cắm đối phương để tránh bị bóng bổng phản công!`,
      suggestedActions: [
        { label: "📋 Xem Sơ Đồ Chiến Thuật 3-2-1", actionType: "OPEN_PITCH_MAP" },
      ],
    };
  }

  // 7. Luật sân 7: Đá biên hay ném biên?
  if (q.includes("biên") || q.includes("ném biên") || q.includes("đá biên")) {
    return {
      success: true,
      reply: `⚽ **Quy Định Đá Biên Sân 7 Cỏ Nhân Tạo:**\n\n• Sân 7 phủi áp dụng hình thức **ĐÁ BIÊN** (không ném biên).\n• **Quy chuẩn thực hiện:** Đặt bóng chết trên vạch biên hoặc ngoài vạch biên không quá 25cm. Chân trụ không được dẫm hẳn vào trong sân.\n• **Lưu ý ghi bàn:** Quả đá biên sút thẳng vào cầu môn nếu **không chạm ai** thì **không được công nhận bàn thắng**!`,
    };
  }

  // 8. Luật sân 7: Thủ môn bắt bóng chuyền về & phát bóng
  if (
    q.includes("chuyền về") ||
    q.includes("bắt tay") ||
    q.includes("luật thủ môn") ||
    q.includes("phát bóng")
  ) {
    return {
      success: true,
      reply: `🧤 **Luật Thủ Môn Sân 7 Cần Nằm Lòng:**\n\n• **Chuyền về bằng chân:** Thủ môn **KHÔNG ĐƯỢC dùng tay bắt bóng** (bắt bằng tay sẽ bị phạt gián tiếp ngay sát vạch 6m).\n• **Chuyền về bằng đầu/ngực/đùi:** Thủ môn được phép dùng tay ôm bóng an toàn.\n• **Phát bóng:** Thủ môn phát bóng bằng chân hoặc ném tay qua nửa sân đều hợp lệ, nhưng ném thẳng vào gôn đối phương không tính bàn thắng nếu không chạm ai.`,
    };
  }

  // 9. Luật penalty, phạt đền, đá phạt
  if (
    q.includes("penalty") ||
    q.includes("phạt đền") ||
    q.includes("chấm phạt") ||
    q.includes("hàng rào") ||
    q.includes("đá phạt")
  ) {
    return {
      success: true,
      reply: `🎯 **Quy Định Phạt Đền (Penalty) & Đá Phạt Sân 7:**\n\n• **Cự ly phạt đền:** Đặt bóng tại chấm phạt đền cự ly **9 mét** (trung tâm trước khung thành).\n• **Thủ môn:** Phải đứng trên vạch vôi cầu môn cho đến khi bóng rời chân người sút.\n• **Hàng rào đá phạt:** Đội phòng ngự làm hàng rào phải đứng cách điểm đặt bóng tối thiểu **5 mét**.`,
    };
  }

  // 10. Chiến thuật 3-2-1 Cây Thông
  if (
    q.includes("3-2-1") ||
    q.includes("cây thông") ||
    q.includes("chiến thuật 321") ||
    q.includes("sơ đồ 321")
  ) {
    return {
      success: true,
      reply: `🌲 **Sơ Đồ Chiến Thuật 3-2-1 (Cây Thông Vàng Sân 7):**\n\n• **Bố cục:** 1 Thủ Môn + 1 Thòng (CB) + 2 Hậu Vệ Cánh (LB/RB) + 2 Tiền Vệ Trung Tâm (CM) + 1 Tiền Đạo Cắm (ST).\n• **Ưu điểm:** Cực kỳ cân bằng giữa công và thủ. Hàng thủ 3 người bọc lót chắc chắn, 2 tiền vệ làm chủ tuyến giữa, tiền đạo dễ làm tường.\n• **Bí quyết thắng:** 2 cánh phải có thể lực dồi dào để lên công về thủ nhịp nhàng!`,
      suggestedActions: [
        { label: "🗺️ Mở Bản Đồ Khảo Sát Sân", actionType: "OPEN_PITCH_MAP" },
      ],
    };
  }

  // 11. Các sơ đồ khác: 2-3-1, 3-1-2, 2-1-2-1
  if (
    q.includes("2-3-1") ||
    q.includes("3-1-2") ||
    q.includes("chiến thuật") ||
    q.includes("sơ đồ") ||
    q.includes("đội hình")
  ) {
    return {
      success: true,
      reply: `📋 **Các Sơ Đồ Chiến Thuật Sân 7 Phổ Biến:**\n\n• **2-3-1 (Kiểm Soát):** Dành cho đội có 3 tiền vệ kĩ thuật tốt, thích đập nhả ban bật trung lộ.\n• **3-1-2 (Phản Công Nhanh):** Thủ 3 người chắc chắn, 1 mỏ neo chia bài, 2 tiền đạo cắm tốc độ chớp thời cơ.\n• **3-2-1 (Cây Thông):** Sơ đồ chuẩn mực nhất phủi Hà Nội, công thủ toàn diện và hạn chế tối đa bàn thua sớm!`,
    };
  }

  // 12. Hướng dẫn vị trí: Thòng, Cánh, Tiền vệ, Tiền đạo
  if (
    q.includes("thòng") ||
    q.includes("hậu vệ") ||
    q.includes("tiền vệ") ||
    q.includes("tiền đạo") ||
    q.includes("pivot") ||
    q.includes("đá vị trí")
  ) {
    return {
      success: true,
      reply: `⚽ **Bí Quyết Đá Các Vị Trí Sân 7:**\n\n• **Thòng (CB):** Là linh hồn hàng thủ. Giữ vị trí quét phía sau, không ham dâng cao, bọc lót cho 2 cánh và chỉ huy đội hình.\n• **Cánh (Wing-back):** Chạy bền, hỗ trợ kéo giãn biên và tạt bóng hoặc bó vào trong dứt điểm.\n• **Tiền vệ (CM):** Quan sát 360 độ, cầm nhịp và phân phối bóng.\n• **Tiền đạo (ST/Pivot):** Tì đè cài người, làm tường nhả về cho tuyến 2 băng lên sút xa!`,
    };
  }

  // 13. Chọn giày đá bóng cỏ nhân tạo: Đinh TF vs AG vs FG
  if (
    q.includes("giày") ||
    q.includes("đinh tf") ||
    q.includes("đinh ag") ||
    q.includes("đinh fg") ||
    q.includes("mua giày") ||
    q.includes("chọn giày")
  ) {
    return {
      success: true,
      reply: `👟 **Bí Quyết Chọn Giày Đá Sân Cỏ Nhân Tạo Hà Nội:**\n\n• **BẮT BUỘC dùng đinh dăm TF (Turf):** Đế cao su dăm nhỏ, bám sân cực tốt, không bị trượt và bảo vệ cổ chân, khớp gối tối đa!\n• **Cảnh báo đinh FG / AG:** Cỏ nhân tạo ở Việt Nam thường mỏng và nhiều cát cao su. Đi đinh FG/AG rất dễ bị mắc đinh xuống mặt sân gây **lật sơ mi** hoặc **đứt dây chằng chéo (ACL)**!`,
    };
  }

  // 14. Chấn thương thể thao: Lật sơ mi / Lật cổ chân
  if (
    q.includes("lật sơ mi") ||
    q.includes("lật cổ chân") ||
    q.includes("sơ mi") ||
    q.includes("bong gân") ||
    q.includes("chấn thương")
  ) {
    return {
      success: true,
      reply: `🚑 **Xử Trí Cấp Cứu Lật Sơ Mi Cổ Chân (Quy tắc R.I.C.E):**\n\n• **R (Rest):** Dừng đá ngay lập tức, không cố đi lại.\n• **I (Ice):** Chườm đá lạnh 15-20 phút (bọc đá trong khăn, không áp trực tiếp quá lâu).\n• **C (Compression):** Dùng băng thun quấn nhẹ cố định cổ chân.\n• **E (Elevation):** Nằm kê chân cao hơn ngực để giảm tụ máu bầm.\n• ⚠️ **TUYỆT ĐỐI KHÔNG:** Bôi dầu nóng, cồn gừng hay rượu thuốc (làm giãn mạch sưng to hơn)!`,
    };
  }

  // 15. Chuột rút & Căng cơ
  if (
    q.includes("chuột rút") ||
    q.includes("căng cơ") ||
    q.includes("bó cơ") ||
    q.includes("mỏi chân")
  ) {
    return {
      success: true,
      reply: `⚡ **Cách Khắc Phục Chuột Rút Tức Thì Trên Sân:**\n\n• **Thao tác sơ cứu:** Ngồi hoặc nằm duỗi thẳng chân, nhờ đồng đội giữ gót và **bẻ gập mũi bàn chân ngược về phía đầu gối** từ từ, giữ 15-30 giây.\n• **Xoa bóp nhẹ:** Vuốt xuôi từ gối xuống gót chân, không ấn huyệt quá mạnh.\n• **Bù nước & muối:** Uống từng ngụm nước điện giải Oresol hoặc ăn nửa quả chuối tiêu để nạp nhanh Kali và Magie!`,
    };
  }

  // 16. Khởi động trước trận đấu
  if (
    q.includes("khởi động") ||
    q.includes("làm nóng") ||
    q.includes("ép dẻo") ||
    q.includes("trước trận")
  ) {
    return {
      success: true,
      reply: `🔥 **Bài Khởi Động Chuẩn 10 Phút Tránh Chấn Thương:**\n\n1. **Xoay khớp (3 phút):** Xoay kỹ cổ tay, cổ chân, khớp gối, khớp háng và vai cổ.\n2. **Ép cơ (3 phút):** Ép dọc, ép ngang giúp căng giãn cơ đùi trước, đùi sau và gân kheo.\n3. **Kích hoạt nhịp tim (4 phút):** Chạy bước nhỏ, nâng cao đùi, gót chạm mông, di chuyển bước chéo và bứt tốc ngắn 10 mét.`,
    };
  }

  // 17. Ăn uống dinh dưỡng trước và sau đá bóng
  if (
    q.includes("ăn gì") ||
    q.includes("uống gì") ||
    q.includes("dinh dưỡng") ||
    q.includes("nước ngọt") ||
    q.includes("bia") ||
    q.includes("chuối")
  ) {
    return {
      success: true,
      reply: `🍌 **Dinh Dưỡng Cho Anh Em Bóng Đá Phủi:**\n\n• **Trước trận 2-3 tiếng:** Ăn nhẹ tinh bột dễ tiêu (chuối, bánh mì, yến mạch). Tuyệt đối không ăn no sát giờ đá gây đau dạ dày!\n• **Trong trận:** Uống từng ngụm nhỏ nước lọc hoặc nước điện giải. Không uống nước đá quá lạnh gây co thắt phế quản.\n• **Sau trận:** Bù nước đầy đủ trước khi "giao lưu bia bọt" để tránh hạ đường huyết và đau nhức cơ!`,
    };
  }

  // 18. Kèo SOS cứu hộ sát giờ
  if (
    q.includes("sos") ||
    q.includes("kèo sos") ||
    q.includes("cứu hộ") ||
    q.includes("sát giờ")
  ) {
    return {
      success: true,
      reply: `🚨 **Kèo Cứu Hộ SOS - Đặc Quyền Chống Bể Trận:**\n\n• Khi một đội bị đối thủ hủy sát giờ hoặc cần ghép đối gấp trong vòng 60-90 phút trước giờ lăn bóng, trận đấu chuyển sang trạng thái **Kèo SOS**.\n• **Đội nhận kèo SOS:** Được ưu tiên nổi bật trên đầu bảng tin và cộng thưởng **+8 điểm Uy Tín** tín nhiệm sau trận!\n• Hai đội bắt buộc ký quỹ cọc 200k để bảo chứng không xảy ra tình trạng bỏ sân.`,
      suggestedActions: [
        { label: "🚨 Nhận Kèo SOS Giờ Vàng", actionType: "OPEN_SOS" },
      ],
    };
  }

  // 19. Mã bắt tay 4 số (Handshake OTP)
  if (
    q.includes("mã bắt tay") ||
    q.includes("bắt tay") ||
    q.includes("otp") ||
    q.includes("4 số") ||
    q.includes("xác thực")
  ) {
    return {
      success: true,
      reply: `🤝 **Mã Bắt Tay 4 Số - Chốt Kèo Văn Minh & Nhả Cọc:**\n\n• Khi 2 đội đến sân gặp mặt, Đội Khách mở app đọc **Mã Bắt Tay 4 số** ngẫu nhiên cho Đội Nhà nhập xác nhận.\n• **Tác dụng:**\n  1. Xác nhận trận đấu diễn ra thực tế tại sân (chống báo cáo ảo).\n  2. Tự động hoàn trả 100% tiền cọc 200.000đ về ví khả dụng của cả hai đội.\n  3. Cộng thêm +2 điểm Uy Tín thi đấu đẹp mắt!`,
    };
  }

  // 20. Điểm Uy Tín, thang điểm 100đ, phạt trừ điểm
  if (
    q.includes("uy tín") ||
    q.includes("điểm uy tín") ||
    q.includes("100 điểm") ||
    q.includes("trừ điểm") ||
    q.includes("khóa tài khoản")
  ) {
    return {
      success: true,
      reply: `⭐ **Hệ Thống Điểm Uy Tín GiaoHuu.vn (0 - 100 Điểm):**\n\n• **100đ:** Điểm mặc định cho đội bóng chuẩn chỉ. Được **MIỄN CỌC TIỀN MẶT** khi bắt đối!\n• **Dưới 70đ:** Bị cảnh báo, bắt buộc ký quỹ 200.000đ mỗi khi tạo hoặc nhận kèo.\n• **Hoàn thành trận đấu:** +2đ Uy Tín sau mỗi trận đá văn minh.\n• **Bùng kèo vô cớ:** Trừ nặng **-30đ đến -40đ** và tịch thu cọc chuyển cho đội bị bùng!`,
    };
  }

  // 21. Phân hạng Tier phủi: Tier 1, Tier 2, Tier 3
  if (
    q.includes("tier") ||
    q.includes("phân hạng") ||
    q.includes("trình độ") ||
    q.includes("dưỡng sinh") ||
    q.includes("bán chuyên")
  ) {
    return {
      success: true,
      reply: `🏆 **Hệ Thống Phân Hạng Tier Bóng Đá Phủi:**\n\n• **Tier 1 (Dưỡng Sinh - Văn Phòng):** Giao lưu vui vẻ, rèn luyện sức khỏe, **CẤM XOẠC BÓNG**, không va chạm mạnh, kết thúc bằng bữa bia bàn công việc.\n• **Tier 2 (Phong Trào Cứng):** Có thể lực, kỹ thuật căn bản, tranh chấp vừa phải.\n• **Tier 3 (Bán Chuyên):** Cọ xát tốc độ cao, chiến thuật bài bản, nhiều cầu thủ ăn tập chuyên nghiệp!`,
    };
  }

  // 22. Giá thuê sân cỏ nhân tạo Hà Nội
  if (
    q.includes("giá sân") ||
    q.includes("tiền sân") ||
    q.includes("thuê sân bao nhiêu") ||
    q.includes("giá thuê") ||
    q.includes("chi phí")
  ) {
    return {
      success: true,
      reply: `💰 **Mặt Bằng Giá Thuê Sân Cỏ Nhân Tạo Hà Nội (Ca 90 Phút):**\n\n• **Khung giờ vàng (17h30 - 19h00 - 20h30):** Dao động từ **600.000đ - 900.000đ / trận** (đã gồm dàn đèn & trà đá).\n• **Khung giờ trưa / đầu giờ chiều (11h30 - 16h00):** Rẻ hơn, khoảng **300.000đ - 500.000đ / trận**.\n• Hai đội bắt kèo cưa đôi tiền sân rất tiết kiệm (khoảng 300k - 450k mỗi đội)!`,
      suggestedActions: [
        { label: "🗺️ Khảo Sát Bản Đồ Sân Phủi", actionType: "OPEN_PITCH_MAP" },
      ],
    };
  }

  // 23. Danh sách sân bóng theo quận (Cầu Giấy, Nam Từ Liêm, Thanh Xuân, Đống Đa...)
  if (
    q.includes("sân") ||
    q.includes("cầu giấy") ||
    q.includes("nam từ liêm") ||
    q.includes("thanh xuân") ||
    q.includes("đống đa") ||
    q.includes("ba đình") ||
    q.includes("mỹ đình") ||
    q.includes("hoàng mai") ||
    q.includes("địa chỉ") ||
    q.includes("ở đâu")
  ) {
    const list = HANOI_PITCHES.slice(0, 3)
      .map((p) => `• **${p.name}** (${p.district}): ${p.address}`)
      .join("\n");
    return {
      success: true,
      reply: `🏟️ **Cụm Sân Cỏ Nhân Tạo Hà Nội Chuẩn Sân 7:**\n\n${list}\n\n• Bạn bấm nút **"Bản Đồ"** bên dưới để xem toạ độ GPS, chất lượng cỏ, dàn đèn led và số điện thoại chủ sân từng cụm!`,
      suggestedActions: [
        { label: "🗺️ Mở Bản Đồ Sân Phủi", actionType: "OPEN_PITCH_MAP" },
      ],
    };
  }

  // 24. Hotline Zalo Ban Quản Trị, liên hệ hỗ trợ
  if (
    q.includes("zalo") ||
    q.includes("hotline") ||
    q.includes("liên hệ") ||
    q.includes("admin") ||
    q.includes("bqt") ||
    q.includes("sđt") ||
    q.includes("số điện thoại") ||
    q.includes("gặp ai")
  ) {
    return {
      success: true,
      reply: `📞 **Kênh Hỗ Trợ Khách Hàng Trực Tiếp Zalo BQT:**\n\n• **Hotline / Zalo Trực Ban:** \`0393.407.855\` (nhấn nút bên dưới để mở ngay ứng dụng Zalo).\n• **Thời gian hỗ trợ:** 24/7 (Đặc biệt túc trực trong các khung giờ vàng 17h30 - 22h00 để hỗ trợ ghép đối, giải quyết khiếu nại và duyệt rút tiền cọc).`,
      suggestedActions: [
        { label: "💬 Mở Zalo Ban Quản Trị Ngay", actionType: "OPEN_ZALO" },
      ],
    };
  }

  // 25. Cầu thủ nổi tiếng & Thần tượng bóng đá
  if (
    q.includes("ronaldo") ||
    q.includes("messi") ||
    q.includes("cr7") ||
    q.includes("m10") ||
    q.includes("tuấn anh") ||
    q.includes("capdervila") ||
    q.includes("long thổ") ||
    q.includes("phương vertu")
  ) {
    return {
      success: true,
      reply: `⭐ **Bóng Đá Là Đam Mê & Tình Anh Em!**\n\n• Dù bạn là fan Messi với những pha đi bóng ma thuật, fan CR7 với ý chí tập luyện thép, hay hâm mộ các phù thủy phủi Hà Nội (Tuấn Anh "Jr", Long "Thổ", Capdervila)...\n• Tất cả đều có chung một tình yêu mãnh liệt với quả bóng tròn trên sân cỏ nhân tạo mỗi buổi chiều sau giờ làm việc! Chúc anh em ra sân luôn chân cứng đá mềm! ⚽🔥`,
    };
  }

  // 26. Chào hỏi, cảm ơn, khen ngợi
  if (
    q.includes("chào") ||
    q.includes("hello") ||
    q.includes("hi") ||
    q.includes("alo") ||
    q.includes("ơi") ||
    q.includes("cảm ơn") ||
    q.includes("thanks") ||
    q.includes("tuyệt vời") ||
    q.includes("app hay")
  ) {
    return {
      success: true,
      reply: `⚽ **GiaoHuu.vn AI xin chào anh em đồng banh!**\n\nRất hân hạnh được hỗ trợ đội bạn! Tôi sẵn sàng giải đáp ngay mọi vấn đề về:\n• 🛡️ Ký quỹ cọc 200k & cách rút tiền trước 22h00\n• ⚠️ Đền bù 200k khi đối thủ bùng kèo\n• 🧤 Thuê thủ môn (GK) & Chợ Cầu tuyển quân\n• 📋 Sơ đồ chiến thuật 3-2-1, 2-3-1 sân 7\n• 👟 Cách chọn giày đinh TF & sơ cứu lật sơ mi\n\nBạn hãy gõ câu hỏi hoặc bấm các gợi ý nhé!`,
      suggestedActions: [
        { label: "🛡️ Cọc 200k rút thế nào?", actionType: "OPEN_WALLET" },
        { label: "⚠️ Bị bùng kèo ai đền tiền?", actionType: "OPEN_SOS" },
        { label: "💬 Chat Zalo Trực Tiếp BQT", actionType: "OPEN_ZALO" },
      ],
    };
  }

  // 27. Fallback thông minh linh hoạt cho mọi câu hỏi khác
  return {
    success: true,
    reply: `⚽ **Trợ Lý GiaoHuu.vn đã nhận câu hỏi của bạn!**\n\nCâu hỏi của bạn: *" ${query} "*\n\nHiện tại hệ thống hỗ trợ giải đáp tức thì các chủ đề cốt lõi:\n• 🛡️ **Ký quỹ 200k & Rút tiền trước 22h** qua VietQR Napas247.\n• ⚠️ **Bảo hiểm bùng kèo:** Đội bị bùng nhận đủ 200k tiền sân.\n• 🌧️ **Kháng cáo 1-chạm:** Mưa bão ngập sân giữ 100đ Uy Tín.\n• 🧤 **Chợ Cầu & Thuê Thủ Môn (GK)** theo từng quận.\n• 📋 **Luật sân 7, chiến thuật 3-2-1 & chọn giày đinh TF**.\n\nNếu cần hỗ trợ riêng hoặc xử lý ca đặc biệt, bạn bấm nút chat Zalo bên dưới để gặp trực tiếp BQT nhé!`,
    suggestedActions: [
      { label: "💬 Chat Trực Tiếp Zalo BQT (0393.407.855)", actionType: "OPEN_ZALO" },
      { label: "💼 Mở Ví Ký Quỹ & Cọc", actionType: "OPEN_WALLET" },
      { label: "🗺️ Xem Bản Đồ Sân Phủi", actionType: "OPEN_PITCH_MAP" },
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

  const geminiApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  // Nếu có cấu hình GEMINI_API_KEY, gọi mô hình Gemini để trả lời linh hoạt mọi câu hỏi mở
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

      const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];
      
      for (const modelCode of modelsToTry) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelCode}:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents,
                systemInstruction: {
                  parts: [{ text: SYSTEM_INSTRUCTION }],
                },
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 600,
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
        } catch (callErr) {
          console.warn(`[Gemini API ${modelCode} Error]`, callErr);
        }
      }
    } catch (err) {
      console.warn("[Gemini AI Error - Fallback to Supercharged Engine]", err);
    }
  }

  // Fallback an toàn và tức thì: Dùng Supercharged Offline Knowledge Engine
  return getSmartOfflineResponse(userQuestion);
}
