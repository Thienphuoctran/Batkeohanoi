import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { RefreshCw, ShieldCheck, CheckCircle2, Clock, AlertTriangle, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Chính Sách Hoàn Tiền & Quy Chế Ví Ký Quỹ — GiaoHuu.VN",
  description:
    "Quy chế ký quỹ bảo chứng 200.000đ, chính sách hoàn cọc 100% và thời gian giải ngân VietQR Napas247 tại GiaoHuu.VN.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Chính Sách Hoàn Tiền &amp; Quy Chế Ví Ký Quỹ"
      subtitle="Quy định minh bạch về cơ chế ký quỹ bảo chứng 200.000đ, các điều kiện hoàn cọc 100%, bảo vệ đội bóng khỏi bùng kèo và quy trình giải ngân tài chính qua VietQR Napas247."
      effectiveDate="01/01/2026"
      activePath="/refund"
    >
      {/* 1. Bản chất cơ chế bảo chứng */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>1. Bản Chất Của Ví Ký Quỹ Bảo Chứng (In-App Escrow Balance)</span>
        </h2>
        <p>
          Ví Ký Quỹ là cơ chế công nghệ được thiết kế nhằm <strong>bảo vệ quyền lợi của các đội bóng phong trào</strong> và duy trì sự văn minh cho sân cỏ. Số tiền bảo chứng tiêu chuẩn là <strong>200.000 VNĐ / trận</strong>.
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-700 text-xs">
          <li><strong>Đội có điểm tín nhiệm 100★:</strong> Được hệ thống bảo lãnh tín nhiệm, hoàn toàn <strong>MIỄN CỌC TIỀN MẶT</strong> khi đăng kèo và nhận đối.</li>
          <li><strong>Đội có điểm tín nhiệm dưới 70★ (hoặc từng có tiền lệ hủy sát giờ):</strong> Bắt buộc duy trì số dư ký quỹ 200.000đ trong ví để bảo chứng cho trận đấu đã cam kết.</li>
        </ul>
      </section>

      {/* 2. Điều kiện hoàn cọc 100% */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <CheckCircle2 className="w-5 h-5 text-sky-700" />
          <span>2. Các Trường Hợp Được Hoàn Trả Tiền Cọc 100%</span>
        </h2>
        <div className="space-y-2.5 text-xs">
          <div className="p-3.5 bg-[#ede8dc] rounded-2xl border border-stone-300">
            <strong className="text-stone-900 text-sm block mb-1">
              ✓ Trường Hợp 1: Nhập Mã Bắt Tay 4 Số Thành Công Tại Sân
            </strong>
            <p className="text-stone-700 leading-relaxed">
              Hai đội có mặt tại sân bóng đúng giờ, đối chiếu và nhập đúng mã bắt tay OTP 4 chữ số trên ứng dụng. Hệ thống tự động <strong>nhả ngay 100% số tiền 200.000đ bị tạm khóa</strong> về số dư khả dụng của ví và thưởng thêm +10 điểm uy tín.
            </p>
          </div>

          <div className="p-3.5 bg-[#ede8dc] rounded-2xl border border-stone-300">
            <strong className="text-stone-900 text-sm block mb-1">
              ✓ Trường Hợp 2: Hủy Kèo Hợp Lệ Trước &gt; 4 Tiếng (Hoặc Đồng Thuận 2 Bên)
            </strong>
            <p className="text-stone-700 leading-relaxed">
              Nếu đội bạn phát sinh việc đột xuất và thực hiện yêu cầu hủy trận trước giờ bóng lăn tối thiểu 4 tiếng, hoặc khi hai Đội trưởng cùng đồng thuận hủy bỏ trận đấu: Tiền cọc được <strong>hoàn trả 100% không trừ bất kỳ chi phí nào</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-[#ede8dc] rounded-2xl border border-stone-300">
            <strong className="text-stone-900 text-sm block mb-1">
              ✓ Trường Hợp 3: Sự Cố Bất Khả Kháng (Thời Tiết Mưa Bão / Sân Mất Điện)
            </strong>
            <p className="text-stone-700 leading-relaxed">
              Trường hợp mưa bão to ngập sân cỏ, cụm sân bóng bị mất điện, hoặc xảy ra sự cố giao thông có hình ảnh bằng chứng: Đội trưởng gửi <strong>Đơn Kháng Cáo</strong>. Ban Quản Trị cam kết thẩm định và phê duyệt giải oan trong vòng <strong>15 phút</strong>, hoàn trả 100% cọc và bảo toàn 100 điểm tín nhiệm.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Trường hợp tịch thu cọc */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <AlertTriangle className="w-5 h-5 text-rose-700" />
          <span>3. Chế Tài Khi Bùng Kèo: Chuyển Cọc Đền Bù Cho Đội Bị Hại</span>
        </h2>
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-950 space-y-2">
          <p className="font-bold">Quy định xử phạt đối với hành vi Đơn Phương Bùng Kèo:</p>
          <p className="leading-relaxed">
            Nếu một đội đã chốt lịch nhưng không đến sân mà không báo trước hoặc hủy kèo sát giờ (&lt; 1 tiếng) gây tổn thất tiền sân cho đối thủ:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li><strong>Tịch thu 100% số tiền cọc (200.000 VNĐ)</strong> của đội vi phạm.</li>
            <li>Toàn bộ số tiền này được hệ thống chuyển thẳng vào ví của đội bị hại để bù đắp chi phí thuê sân cỏ nhân tạo.</li>
            <li>Đội vi phạm bị trừ -30 điểm tín nhiệm và gắn nhãn đỏ cảnh báo trên toàn hệ thống sân bóng Thủ đô.</li>
          </ul>
        </div>
      </section>

      {/* 4. Quy trình rút tiền về tài khoản ngân hàng */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Clock className="w-5 h-5 text-indigo-700" />
          <span>4. Quy Trình Rút Tiền Từ Ví Về Tài Khoản Ngân Hàng (Napas247)</span>
        </h2>
        <p>
          Đội trưởng có điểm tín nhiệm từ <strong>70★ trở lên</strong> có toàn quyền rút số dư khả dụng trong ví ký quỹ về tài khoản ngân hàng cá nhân bất cứ lúc nào:
        </p>
        <div className="rounded-2xl bg-[#ede8dc] p-4 border border-stone-300 space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-stone-900 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
              1
            </span>
            <p className="text-stone-700">
              <strong>Tạo lệnh rút:</strong> Mở mục &quot;Ví Ký Quỹ&quot; ➔ Bấm &quot;Yêu Cầu Rút Cọc&quot; ➔ Nhập số tiền, tên ngân hàng và số tài khoản chính chủ (hoặc tải ảnh mã VietQR).
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-stone-900 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
              2
            </span>
            <p className="text-stone-700">
              <strong>Xử lý giải ngân:</strong> Ban Quản Trị tiếp nhận thông báo tức thời qua Telegram Bot và thực hiện chuyển khoản 24/7 về số tài khoản của bạn.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-stone-900 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
              3
            </span>
            <p className="text-stone-700">
              <strong>Thời gian nhận tiền:</strong> Thông thường từ <strong>5 đến 15 phút</strong>. Khung giờ xử lý rút tiền hàng ngày là từ 07:00 đến 22:00 cùng ngày.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Kênh hỗ trợ tài chính */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <HelpCircle className="w-5 h-5 text-amber-700" />
          <span>5. Kênh Hỗ Trợ Đối Soát &amp; Khiếu Nại Tài Chính</span>
        </h2>
        <p className="text-xs text-stone-700">
          Nếu sau 30 phút kể từ khi gửi lệnh rút tiền mà bạn chưa nhận được biến động số dư ngân hàng, vui lòng liên hệ ngay với Bộ phận Kế toán &amp; Đối soát qua Hotline: <strong className="font-mono text-stone-900">0988.666.888</strong> hoặc Zalo Chăm sóc khách hàng để được kiểm tra và xử lý ưu tiên.
        </p>
      </section>
    </LegalPageLayout>
  );
}
