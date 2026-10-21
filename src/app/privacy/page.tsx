import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { ShieldCheck, Lock, Eye, Database, Trash2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật Dữ Liệu Cá Nhân — GiaoHuu.VN",
  description:
    "Cam kết bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP và Luật An ninh mạng tại sàn bóng đá GiaoHuu.VN.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Chính Sách Bảo Mật Dữ Liệu Cá Nhân"
      subtitle="Quy định minh bạch về cách thức GiaoHuu.VN thu thập, xử lý, bảo vệ và quản lý thông tin của Đội trưởng và Vận động viên tham gia sàn đấu theo Nghị định 13/2023/NĐ-CP."
      effectiveDate="01/01/2026"
      activePath="/privacy"
    >
      {/* Lời mở đầu */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>1. Cam Kết Chung &amp; Căn Cứ Pháp Lý</span>
        </h2>
        <p>
          Nền tảng <strong>GiaoHuu.VN</strong> (sau đây gọi tắt là &quot;Chúng tôi&quot; hoặc &quot;Hệ thống&quot;) cam kết tôn trọng và bảo vệ quyền riêng tư của mọi Đội trưởng, Cầu thủ và Người dùng truy cập dịch vụ. Chính sách bảo mật này được lập dựa trên các quy định hiện hành của pháp luật Việt Nam, bao gồm:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-700">
          <li><strong>Luật An ninh mạng số 24/2018/QH14</strong> của Quốc hội nước CHXHCN Việt Nam.</li>
          <li><strong>Nghị định 13/2023/NĐ-CP</strong> của Chính phủ về Bảo vệ dữ liệu cá nhân (có hiệu lực từ ngày 01/07/2023).</li>
          <li><strong>Luật Giao dịch điện tử số 20/2023/QH15</strong>.</li>
        </ul>
      </section>

      {/* Thu thập dữ liệu tối giản */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Database className="w-5 h-5 text-amber-700" />
          <span>2. Nguyên Tắc Tối Thiểu Hóa Dữ Liệu (Chỉ Thu Data Thật Sự Cần)</span>
        </h2>
        <p>
          Tuân thủ nguyên tắc giới hạn mục đích và tối thiểu hóa dữ liệu, GiaoHuu.VN <strong>KHÔNG</strong> thu thập dữ liệu nhạy cảm như Căn cước công dân (CCCD), tài khoản mạng xã hội cá nhân, hay định vị GPS liên tục ngoài sân cỏ. Chúng tôi chỉ thu thập các trường thông tin sau:
        </p>
        <div className="rounded-2xl bg-[#ede8dc] p-4 border border-stone-300 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#fbf9f4] rounded-xl border border-stone-300">
              <strong className="text-stone-900 block mb-1">Dành Cho Đội Trưởng:</strong>
              <p className="text-stone-600">
                • Họ tên liên hệ thi đấu.<br />
                • Số điện thoại Zalo chính chủ (để ghép đối 1-chạm).<br />
                • Tên đội bóng, quận hoạt động, khung giờ quen thuộc.
              </p>
            </div>
            <div className="p-3 bg-[#fbf9f4] rounded-xl border border-stone-300">
              <strong className="text-stone-900 block mb-1">Dành Cho Giao Dịch Hoàn Cọc:</strong>
              <p className="text-stone-600">
                • Số tài khoản ngân hàng &amp; tên chủ tài khoản.<br />
                • Tên ngân hàng thụ hưởng (VietQR Napas247) phục vụ lệnh rút tiền ký quỹ về tài khoản.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mục đích sử dụng */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Eye className="w-5 h-5 text-sky-700" />
          <span>3. Mục Đích Sử Dụng Dữ Liệu</span>
        </h2>
        <p>Thông tin thu thập chỉ được dùng vào các mục đích công khai sau:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-700">
          <li><strong>Khóa slot ghép trận:</strong> Hiển thị số điện thoại và liên kết Zalo để 2 Đội trưởng trực tiếp liên hệ chốt màu áo và giờ thi đấu.</li>
          <li><strong>Xác thực điểm tín nhiệm:</strong> Ngăn chặn tài khoản ảo, chống tình trạng một người dùng nhiều số điện thoại ảo để bùng kèo phá hoại sân bóng.</li>
          <li><strong>Thực hiện lệnh hoàn cọc:</strong> Chuyển tiền từ Ví ký quỹ bảo chứng về tài khoản ngân hàng của Đội trưởng khi hủy kèo hợp lệ hoặc hoàn thành trận đấu.</li>
          <li><strong>Gửi thông báo trận đấu:</strong> Gửi tin nhắn trạng thái ghép đối qua bot tự động (Zalo/Telegram/SMS).</li>
        </ul>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 font-bold">
          ⚠️ CAM KẾT: GiaoHuu.VN tuyệt đối KHÔNG bán, cho thuê hoặc chia sẻ dữ liệu số điện thoại của người dùng cho bất kỳ bên thứ ba nào vì mục đích tiếp thị rác, telesale hay quảng cáo thương mại.
        </div>
      </section>

      {/* Bên thứ ba tham gia xử lý dữ liệu */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Lock className="w-5 h-5 text-indigo-700" />
          <span>4. Khai Báo Các Đối Tác Công Nghệ Thứ Ba</span>
        </h2>
        <p>
          Để đảm bảo nền tảng vận hành mượt mà với độ sẵn sàng cao, chúng tôi hợp tác kỹ thuật với các hạ tầng đạt chứng chỉ an toàn quốc tế (SOC2, ISO 27001):
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-700">
          <li><strong>Supabase Inc (Singapore Region):</strong> Lưu trữ cơ sở dữ liệu và quản lý phiên xác thực người dùng được mã hóa SSL/TLS 1.3.</li>
          <li><strong>Vercel Inc:</strong> Hạ tầng lưu trữ và phân phối biên Edge Network.</li>
          <li><strong>Google LLC:</strong> Cung cấp giao thức đăng nhập an toàn Google OAuth 1-chạm.</li>
          <li><strong>Hệ thống Napas247 &amp; VietQR:</strong> Xử lý lệnh thanh toán và hoàn cọc trực tiếp giữa tài khoản ngân hàng.</li>
        </ul>
      </section>

      {/* Quyền của người dùng & Xóa data */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Trash2 className="w-5 h-5 text-rose-700" />
          <span>5. Quyền Yêu Cầu Xóa Dữ Liệu (Right To Erasure / Forgotten)</span>
        </h2>
        <p>
          Theo Điều 14 Nghị định 13/2023/NĐ-CP, bạn có toàn quyền:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-700">
          <li>Yêu cầu tra cứu, chỉnh sửa thông tin đội bóng và số điện thoại liên kết.</li>
          <li>Yêu cầu <strong>xóa vĩnh viễn tài khoản</strong>, lịch sử trận đấu và thông tin cá nhân khỏi hệ thống máy chủ GiaoHuu.VN khi không còn nhu cầu tham gia sàn.</li>
          <li>Rút lại sự đồng ý xử lý dữ liệu bất cứ lúc nào.</li>
        </ul>
        <div className="p-3.5 rounded-xl bg-[#ede8dc] border border-stone-300 text-xs text-stone-800 space-y-1">
          <p className="font-bold">Cách thức gửi yêu cầu xóa dữ liệu cá nhân:</p>
          <p>
            Đội trưởng chỉ cần gửi email từ hòm thư đã đăng ký tới: <strong className="font-mono text-stone-900">phuocct998@gmail.com</strong> với tiêu đề: <em>&quot;[GiaoHuu.VN] Yêu cầu xóa dữ liệu tài khoản - SĐT: 09xxx&quot;</em>. Ban Quản Trị sẽ xử lý và phản hồi bằng văn bản xác nhận hủy dữ liệu trong vòng <strong>72 giờ làm việc</strong>.
          </p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
