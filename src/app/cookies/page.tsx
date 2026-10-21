import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { Cookie, Settings, CheckCircle2, Shield, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Chính Sách Cookie & Lưu Trữ Phiên — GiaoHuu.VN",
  description:
    "Quy định minh bạch về cookie kỹ thuật và công nghệ lưu trữ cục bộ trên trình duyệt tại sàn bóng đá GiaoHuu.VN.",
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Chính Sách Cookie &amp; Công Nghệ Lưu Trữ"
      subtitle="Giải thích cách GiaoHuu.VN sử dụng Cookie và LocalStorage để duy trì phiên làm việc của Đội trưởng, đảm bảo tốc độ tải trang nhanh và bảo vệ tài khoản khỏi truy cập trái phép."
      effectiveDate="01/01/2026"
      activePath="/cookies"
    >
      {/* 1. Cookie là gì */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Cookie className="w-5 h-5 text-amber-700" />
          <span>1. Cookie &amp; Lưu Trữ Cục Bộ Là Gì?</span>
        </h2>
        <p>
          Cookie là các tệp văn bản nhỏ được lưu trữ trên trình duyệt của máy tính hoặc điện thoại khi bạn truy cập website. Cookie và các công nghệ lưu trữ web hiện đại (như LocalStorage và SessionStorage) giúp trang web ghi nhớ thiết bị, ghi nhớ phiên đăng nhập và các tùy chọn cá nhân của bạn để bạn không phải đăng nhập lại mỗi khi mở tab mới.
        </p>
      </section>

      {/* 2. Danh mục Cookie cụ thể */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Settings className="w-5 h-5 text-emerald-700" />
          <span>2. Danh Mục Các Công Nghệ Lưu Trữ GiaoHuu.VN Sử Dụng</span>
        </h2>
        <p>
          GiaoHuu.VN áp dụng chính sách <strong>No Advertising Tracking Cookies</strong> — nghĩa là chúng tôi <strong>KHÔNG</strong> cài đặt bất kỳ cookie theo dõi quảng cáo chéo hay bán hành vi duyệt web cho mạng lưới quảng cáo thương mại. Chúng tôi chỉ sử dụng các loại sau:
        </p>

        <div className="rounded-2xl border border-stone-300 overflow-hidden bg-[#ede8dc] text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e4decb] border-b border-stone-400 font-black text-stone-900 uppercase text-[11px]">
                <th className="py-2.5 px-3">Tên Cookie / Key</th>
                <th className="py-2.5 px-3">Phân Loại</th>
                <th className="py-2.5 px-3">Mục Đích Sử Dụng</th>
                <th className="py-2.5 px-3">Thời Hạn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-300">
              <tr className="hover:bg-amber-100/50">
                <td className="py-2.5 px-3 font-mono font-bold text-stone-900">bk7_access_token</td>
                <td className="py-2.5 px-3">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 text-[10px]">
                    Bắt Buộc (HttpOnly)
                  </span>
                </td>
                <td className="py-2.5 px-3 text-stone-700">
                  Lưu trữ token phiên đăng nhập mã hóa an toàn giữa trình duyệt và máy chủ.
                </td>
                <td className="py-2.5 px-3 text-stone-600 font-mono">30 Ngày</td>
              </tr>
              <tr className="hover:bg-amber-100/50">
                <td className="py-2.5 px-3 font-mono font-bold text-stone-900">bk7_user_id</td>
                <td className="py-2.5 px-3">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 text-[10px]">
                    Bắt Buộc
                  </span>
                </td>
                <td className="py-2.5 px-3 text-stone-700">
                  Định danh ID tài khoản Đội trưởng để tải nhanh hồ sơ đội và lịch thi đấu.
                </td>
                <td className="py-2.5 px-3 text-stone-600 font-mono">30 Ngày</td>
              </tr>
              <tr className="hover:bg-amber-100/50">
                <td className="py-2.5 px-3 font-mono font-bold text-stone-900">batkeo7_escrow_wallet</td>
                <td className="py-2.5 px-3">
                  <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 font-bold border border-sky-300 text-[10px]">
                    LocalStorage
                  </span>
                </td>
                <td className="py-2.5 px-3 text-stone-700">
                  Ghi nhớ số dư ví ký quỹ khả dụng để hiển thị tức thì không cần đợi tải lại mạng.
                </td>
                <td className="py-2.5 px-3 text-stone-600 font-mono">Lưu Cục Bộ</td>
              </tr>
              <tr className="hover:bg-amber-100/50">
                <td className="py-2.5 px-3 font-mono font-bold text-stone-900">batkeo7_bot_logs</td>
                <td className="py-2.5 px-3">
                  <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 font-bold border border-sky-300 text-[10px]">
                    LocalStorage
                  </span>
                </td>
                <td className="py-2.5 px-3 text-stone-700">
                  Lưu trữ lịch sử chuông thông báo ghép đối và cập nhật trận đấu gần nhất.
                </td>
                <td className="py-2.5 px-3 text-stone-600 font-mono">Lưu Cục Bộ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Cookie bên thứ ba */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Shield className="w-5 h-5 text-indigo-700" />
          <span>3. Cookie Bên Thứ Ba (Google OAuth)</span>
        </h2>
        <p>
          Khi bạn sử dụng tính năng <strong>&quot;Tiếp tục với Google (1-chạm)&quot;</strong>, Google LLC có thể thiết lập các cookie phiên làm việc tạm thời nhằm xác thực quyền sở hữu tài khoản Gmail của bạn một cách bảo mật theo tiêu chuẩn OpenID Connect. GiaoHuu.VN không kiểm soát trực tiếp các cookie này và không có quyền truy cập mật khẩu Gmail của bạn.
        </p>
      </section>

      {/* 4. Quản lý và Tắt Cookie */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Info className="w-5 h-5 text-amber-700" />
          <span>4. Cách Thức Quản Lý &amp; Xóa Cookie Trên Trình Duyệt</span>
        </h2>
        <p>
          Bạn có toàn quyền xóa hoặc chặn cookie bất cứ lúc nào thông qua phần cài đặt của trình duyệt bạn đang sử dụng:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-stone-700 text-xs pl-2">
          <li><strong>Google Chrome:</strong> Cài đặt ➔ Quyền riêng tư và bảo mật ➔ Xóa dữ liệu duyệt web / Cookie của bên thứ ba.</li>
          <li><strong>Apple Safari (iOS / macOS):</strong> Cài đặt ➔ Safari ➔ Xóa lịch sử và dữ liệu trang web.</li>
          <li><strong>Microsoft Edge:</strong> Cài đặt ➔ Cookie và quyền của trang web ➔ Quản trị và xóa cookie.</li>
        </ul>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-900">
          * Lưu ý: Nếu bạn chọn tắt toàn bộ Cookie thiết yếu, bạn sẽ không thể duy trì trạng thái đăng nhập Đội trưởng và sẽ phải đăng nhập lại mỗi khi làm mới trang.
        </div>
      </section>
    </LegalPageLayout>
  );
}
