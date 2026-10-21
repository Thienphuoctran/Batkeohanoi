import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { Scale, Users, AlertTriangle, ShieldAlert, Award, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Điều Khoản Sử Dụng Dịch Vụ — GiaoHuu.VN",
  description:
    "Điều khoản dịch vụ, quy chế hoạt động sàn bóng đá phủi và tuyên bố miễn trừ trách nhiệm thể thao tại GiaoHuu.VN.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Điều Khoản Sử Dụng Dịch Vụ &amp; Quy Chế Sàn"
      subtitle="Thỏa thuận pháp lý giữa Ban Quản Trị GiaoHuu.VN và người dùng tham gia nền tảng kết nối thể thao bóng đá phủi, quy định quyền lợi, nghĩa vụ và giới hạn trách nhiệm pháp lý."
      effectiveDate="01/01/2026"
      activePath="/terms"
    >
      {/* 1. Phạm vi áp dụng */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Scale className="w-5 h-5 text-amber-700" />
          <span>1. Phạm Vi Áp Dụng &amp; Chấp Thuận Điều Khoản</span>
        </h2>
        <p>
          Chào mừng bạn đến với <strong>GiaoHuu.VN</strong> — Sàn kết nối giao hữu bóng đá sân 7 và quản lý kèo phủi văn minh. Bằng việc truy cập, đăng ký tài khoản Đội trưởng hoặc sử dụng bất kỳ tính năng nào trên website (bao gồm cả việc đăng kèo, bắt đối hoặc sử dụng ví ký quỹ), bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý vô điều kiện với toàn bộ các điều khoản được quy định tại văn bản này.
        </p>
        <p>
          Nếu bạn không đồng ý với bất kỳ phần nào của Điều khoản sử dụng này, vui lòng ngừng sử dụng nền tảng ngay lập tức.
        </p>
      </section>

      {/* 2. Nguyên tắc định danh 1 SĐT = 1 Đội */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Users className="w-5 h-5 text-emerald-700" />
          <span>2. Quy Định Tài Khoản &amp; Định Danh Đội Bóng</span>
        </h2>
        <ul className="list-disc list-inside space-y-2 text-stone-700 pl-1">
          <li><strong>Nguyên tắc 1 SĐT = 1 Đội:</strong> Để triệt tiêu vấn nạn tài khoản ảo phá hoại lịch đấu, mỗi số điện thoại chính chủ chỉ được phép đại diện khởi tạo một đội bóng duy nhất trên sàn.</li>
          <li><strong>Trách nhiệm của Đội trưởng:</strong> Đội trưởng chịu hoàn toàn trách nhiệm về tính xác thực của thông tin liên hệ, màu áo thi đấu, trình độ (Tier 1/2/3) và hành vi của các thành viên trong đội bóng tại sân thi đấu.</li>
          <li><strong>Bảo mật tài khoản:</strong> Người dùng có trách nhiệm tự bảo mật mã xác thực OTP, mật khẩu và thiết bị đăng nhập. Mọi thao tác bắt đối hoặc xác nhận hủy trận phát sinh từ tài khoản của bạn được coi là ý chí chính thức của bạn.</li>
        </ul>
      </section>

      {/* 3. Cơ chế Khóa Kèo & Mã Bắt Tay */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <Award className="w-5 h-5 text-sky-700" />
          <span>3. Cơ Chế Khóa Slot &amp; Bắt Tay 4 Số Tại Sân Bóng</span>
        </h2>
        <p>
          Quy trình tổ chức trận đấu trên sàn tuân theo cơ chế công nghệ minh bạch:
        </p>
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-[#ede8dc] rounded-xl border border-stone-300">
            <strong className="text-stone-900">1. Đăng &amp; Bắt Kèo:</strong> Khi đội khách bấm nhận kèo, hệ thống tự động khóa trận (Row-level Lock) và mở liên kết Zalo 1-chạm giữa 2 Đội trưởng.
          </div>
          <div className="p-3 bg-[#ede8dc] rounded-xl border border-stone-300">
            <strong className="text-stone-900">2. Xác Thực Mã Bắt Tay 4 Số:</strong> Hai đội gặp nhau tại sân trước giờ thi đấu, mở ứng dụng và nhập mã bắt tay 4 số. Khi hai bên khớp mã thành công: Trận đấu chính thức được ghi nhận, điểm uy tín được cộng (+10★) và giải phóng 100% tiền cọc (nếu có) về ví.
          </div>
          <div className="p-3 bg-[#ede8dc] rounded-xl border border-stone-300">
            <strong className="text-stone-900">3. Chống Bùng Kèo &amp; Chế Tài:</strong> Trường hợp một đội đơn phương không đến sân mà không báo trước, đội có mặt tại sân có quyền kích hoạt chế độ báo cáo kèm định vị GPS để nhận bồi thường tiền sân từ đối thủ theo Quy chế Kỷ luật.
          </div>
        </div>
      </section>

      {/* 4. Tuyên bố Miễn trừ Trách nhiệm Chấn thương Thể thao */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <AlertTriangle className="w-5 h-5 text-rose-700" />
          <span>4. Tuyên Bố Miễn Trừ Trách Nhiệm Chấn Thương &amp; Thể Thao (Sports Disclaimer)</span>
        </h2>
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-stone-800 space-y-2.5">
          <p className="font-bold text-rose-950 uppercase text-xs">
            ⚠️ ĐIỀU KHOẢN MIỄN TRỪ TRÁCH NHIỆM PHÁP LÝ QUAN TRỌNG:
          </p>
          <p className="text-xs text-rose-900 leading-relaxed">
            1. <strong>Bản chất dịch vụ:</strong> GiaoHuu.VN là nền tảng trung gian công nghệ hỗ trợ kết nối thông tin giữa các đội bóng phong trào và cụm sân cỏ. GiaoHuu.VN <strong>KHÔNG PHẢI</strong> là đơn vị sở hữu sân bóng, không phải ban tổ chức giải đấu chuyên nghiệp và không quản lý trực tiếp vận động viên trên sân cỏ.
          </p>
          <p className="text-xs text-rose-900 leading-relaxed">
            2. <strong>Rủi ro thể thao &amp; Chấn thương:</strong> Bóng đá là môn thể thao đối kháng có nguy cơ xảy ra va chạm, chấn thương thể chất hoặc tai nạn bất khả kháng. Mỗi người tham gia phải tự đánh giá tình trạng sức khỏe cá nhân, tự trang bị bảo hiểm y tế/bảo hiểm tai nạn thể thao. GiaoHuu.VN <strong>hoàn toàn không chịu trách nhiệm pháp lý hoặc bồi thường tài chính</strong> đối với bất kỳ chấn thương, tổn hại sức khỏe, mất mát tài sản cá nhân hay tranh chấp xô xát vật lý nào xảy ra tại khuôn viên sân bóng.
          </p>
          <p className="text-xs text-rose-900 leading-relaxed">
            3. <strong>Tinh thần Fair-Play:</strong> Các đội bóng có nghĩa vụ tuân thủ luật thi đấu bóng đá sân 7, tôn trọng trọng tài, đối thủ và cơ sở vật chất của sân. Mọi hành vi bạo lực sân cỏ sẽ bị cấm tài khoản vĩnh viễn và chuyển giao cơ quan chức năng nếu vi phạm pháp luật hình sự.
          </p>
        </div>
      </section>

      {/* 5. Quyền Sở hữu Trí tuệ */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <ShieldAlert className="w-5 h-5 text-stone-700" />
          <span>5. Quyền Sở Hữu Trí Tuệ</span>
        </h2>
        <p>
          Toàn bộ giao diện người dùng, mã nguồn, thuật toán ghép kèo, thiết kế Vintage Scrapbook, biểu tượng và nhãn hiệu &quot;GiaoHuu.VN&quot; thuộc quyền sở hữu trí tuệ của Ban Quản Trị GiaoHuu.VN. Nghiêm cấm mọi hành vi sao chép, trích xuất dữ liệu tự động (scraping/crawling) hoặc tái sử dụng trái phép khi chưa có văn bản đồng ý.
        </p>
      </section>

      {/* 6. Luật áp dụng */}
      <section className="space-y-3">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide flex items-center gap-2 border-b border-stone-200 pb-2">
          <HelpCircle className="w-5 h-5 text-emerald-700" />
          <span>6. Luật Áp Dụng &amp; Giải Quyết Tranh Chấp</span>
        </h2>
        <p>
          Điều khoản này được điều chỉnh và giải thích theo quy định của pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp phát sinh từ việc sử dụng dịch vụ trước hết sẽ được ưu tiên giải quyết thông qua thương lượng hòa giải trên tinh thần thể thao. Trường hợp không tự hòa giải được, vụ việc sẽ được đưa ra Tòa án nhân dân có thẩm quyền tại Thành phố Hà Nội để giải quyết.
        </p>
      </section>
    </LegalPageLayout>
  );
}
