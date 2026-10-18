"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  ShieldCheck,
  Zap,
  Flame,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Clock,
  ArrowRight,
  ExternalLink,
  Bot,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getZaloDeepLink } from "@/lib/zalo";

const BQT_ZALO_PHONE = "0393407855";

interface AppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport?: () => void;
  onOpenWallet?: () => void;
  onSelectTab?: (tab: string) => void;
}

type GuideSection = "overview" | "flow" | "deposit-rules" | "sos" | "sub-market" | "faq";

export function AppGuideModal({
  isOpen,
  onClose,
  onOpenSupport,
  onOpenWallet,
  onSelectTab,
}: AppGuideModalProps) {
  const [activeSection, setActiveSection] = useState<GuideSection>("overview");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B1120] border border-slate-700/80 w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Cẩm Nang Hướng Dẫn BắtKèo7.vn
                </h2>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                  Bản Chuẩn v2.0
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Hiểu rõ quy chế ghép đối, ví cọc 200k &amp; chống bùng kèo trong 2 phút
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/60 overflow-x-auto flex gap-1.5 shrink-0 no-scrollbar">
          {[
            { id: "overview", label: "🌟 Giới Thiệu", icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: "flow", label: "🔄 Quy Trình 4 Bước", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            { id: "deposit-rules", label: "🛡️ Cọc 200k & Bùng Kèo", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: "sos", label: "🔥 Kèo Cứu Hộ SOS", icon: <Flame className="w-3.5 h-3.5" /> },
            { id: "sub-market", label: "👥 Chợ Cầu & Thủ Môn", icon: <Users className="w-3.5 h-3.5" /> },
            { id: "faq", label: "❓ Câu Hỏi Thường Gặp", icon: <HelpCircle className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as GuideSection)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                activeSection === tab.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeSection === "overview" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Sứ mệnh BắtKèo7 Hà Nội
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  Chấm Dứt 100% Nạn "Bùng Kèo Phủi" &amp; Ghép Đối Chuẩn Trình Độ Sân 7
                </h3>
                <p className="text-slate-300">
                  BắtKèo7.vn là nền tảng công nghệ thể thao đầu tiên áp dụng cơ chế <strong>Bảo Chứng Ký Quỹ VietQR Napas247</strong> kết hợp <strong>Mã Bắt Tay 4 Số và Định Vị GPS</strong> tại các cụm sân cỏ nhân tạo Hà Nội.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Chống Bùng Tuyệt Đối</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Đội bùng bị tịch thu 200k cọc. Đội bị bùng được đền bù trọn vẹn 200k để bù chi phí thuê sân.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <Zap className="w-4 h-4" />
                    <span>Lọc Tier Chuẩn Xác</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    3 hạng trình độ: Tier 1 (dưỡng sinh văn phòng, cấm xoạc), Tier 2 (phong trào cứng), Tier 3 (bán chuyên).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <Flame className="w-4 h-4" />
                    <span>Kèo SOS Cứu Hộ</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Giải cứu trận đấu bị hủy sát giờ. Đội nhận kèo cứu hộ được tài trợ 100k tiền nước.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Users className="w-4 h-4" />
                    <span>Chợ Cầu &amp; Thủ Môn GK</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Tuyển người đá thay và thuê thủ môn bắt gôn theo quận, chat Zalo 1-chạm chốt lịch ngay.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLOW */}
          {activeSection === "flow" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <h3 className="font-extrabold text-white text-sm">
                Quy Trình 4 Bước Bắt Kèo Chuyên Nghiệp:
              </h3>

              <div className="space-y-2.5">
                {[
                  {
                    step: "1",
                    title: "Tìm Hoặc Tạo Kèo Đấu",
                    desc: "Chọn Quận (Cầu Giấy, Nam Từ Liêm, Thanh Xuân...), khung giờ vàng (17h30, 19h00, 20h30) và chọn đúng Tier trình độ đội bạn.",
                  },
                  {
                    step: "2",
                    title: "Khớp Kèo & Ký Quỹ Bảo Chứng",
                    desc: "Hai đội trưởng xác nhận kèo. Nếu điểm Uy Tín dưới 70đ hoặc bắt kèo SOS, hệ thống tạm khóa bảo chứng 200.000đ trong ví.",
                  },
                  {
                    step: "3",
                    title: "Đến Sân & Nhập Mã Bắt Tay 4 Số",
                    desc: "Gặp nhau trên sân, Đội Khách đọc Mã 4 số trên app cho Đội Nhà nhập xác nhận. Hoàn tất mã sẽ tự động nhả 200.000đ cọc về ví khả dụng ngay!",
                  },
                  {
                    step: "4",
                    title: "Rút Tiền Hoặc Đánh Giá Sau Trận",
                    desc: "Rút tiền về ngân hàng qua VietQR Napas247 trước 22h00 (xử lý trong 5-15 phút). Trận đấu hoàn thành chuẩn chỉ giúp tăng điểm Uy Tín.",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-black flex items-center justify-center shrink-0 text-xs">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs mb-0.5">{item.title}</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DEPOSIT RULES */}
          {activeSection === "deposit-rules" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Quy Định Ký Quỹ 200.000đ Cố Định</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  • Đội bóng có điểm Uy Tín <strong>100/100đ</strong> được <strong>MIỄN CỌC TIỀN MẶT</strong> khi tạo kèo thông thường.<br />
                  • Khi điểm Uy Tín <strong>dưới 70đ</strong> hoặc khi tham gia <strong>Kèo SOS</strong>: Hệ thống yêu cầu ký quỹ 200k để bảo vệ quyền lợi đôi bên.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Cơ Chế Phạt Bùng &amp; Đền Bù Tiền Sân</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <li>• <strong>Đội bùng kèo (không đến sân hoặc hủy sát giờ &lt;2h):</strong> Bị tịch thu 100% tiền cọc 200.000đ + trừ -40đ Uy Tín (bị khóa tạo kèo).</li>
                  <li>• <strong>Đội bị bùng (có mặt tại sân đúng hẹn):</strong> Nhận trọn vẹn 200.000đ tiền cọc của đội bùng để bù đắp chi phí thuê sân với chủ sân.</li>
                  <li>• <strong>Cách chứng minh:</strong> Định vị GPS tại sân (&lt;300m) + BQT gọi hotline chủ sân đối chứng.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-1">
                <div className="text-sky-300 font-bold text-xs">🌧️ Hộp Kháng Cáo Bất Khả Kháng (Giải Oan)</div>
                <p className="text-slate-300 text-[11px]">
                  Nếu hủy kèo do mưa ngập sân, hỏng dàn đèn hoặc chủ sân thu hồi sân: Chọn <em>"Kháng Cáo Bất Khả Kháng"</em> và điền SĐT chủ sân. BQT duyệt 1-chạm sẽ khôi phục 100đ Uy Tín và bảo lưu cọc 100%!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SOS */}
          {activeSection === "sos" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/40 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-black">
                  <Flame className="w-5 h-5" />
                  <span>Kèo Cứu Hộ SOS - Cứu Tinh Khi Bể Kèo Giờ Vàng</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Đã bao giờ đội bạn đặt sân xong nhưng đối thủ phút chót thông báo không đá được? Tính năng <strong>Kèo SOS</strong> giúp đẩy trận đấu lên vị trí ưu tiên số 1 toàn Hà Nội!
                </p>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">🎁 Tài trợ tiền nước:</span>
                  <span className="text-emerald-400 font-bold">+100.000đ nước ngọt cho đội nhận kèo</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">⏱️ Thời gian cứu hộ:</span>
                  <span className="text-amber-400 font-bold">Khẩn cấp trong vòng 60-90 phút trước trận</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">🛡️ Cam kết:</span>
                  <span className="text-sky-400 font-bold">Khóa cọc 200k chống hủy lần 2</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SUB-MARKET */}
          {activeSection === "sub-market" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <h3 className="font-extrabold text-white text-sm">
                Chợ Cầu Phủi &amp; Thuê Thủ Môn (GK) Chuyên Nghiệp:
              </h3>
              <p className="text-slate-400 text-[11px]">
                Vào tab <strong>"Chợ Cầu"</strong> trên thanh điều hướng để tìm kiếm cầu thủ tự do và thủ môn bắt gôn:
              </p>

              <div className="space-y-2">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-emerald-400 text-xs">🧤 Thuê Thủ Môn (GK):</h4>
                  <p className="text-slate-400 text-[11px]">
                    Giá thuê thông thường: 100k - 200k/trận (kèm tiền nước/trà đá). Thủ môn có thẻ hồ sơ, đánh giá phản xạ và kinh nghiệm bắt sân 7.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-sky-400 text-xs">👥 Lính Đánh Thuê / Cầu Thủ Tự Do:</h4>
                  <p className="text-slate-400 text-[11px]">
                    Lọc theo vị trí (Hậu vệ cánh, Thòng quét, Tiền vệ, Tiền đạo) và Quận/Huyện. Bấm mở Zalo trao đổi màu áo và chốt giờ hẹn trong 30 giây!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FAQ */}
          {activeSection === "faq" && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              {[
                {
                  q: "Rút tiền cọc về tài khoản ngân hàng thế nào?",
                  a: "Bạn bấm vào mục Ví Ký Quỹ trên đầu trang ➔ Nhập số tài khoản ngân hàng và số tiền muốn rút. BQT chuyển khoản qua VietQR Napas247 bất kỳ lúc nào trước 22h00 hàng ngày (5-15 phút có tiền)!",
                },
                {
                  q: "Mã Bắt Tay 4 số lấy ở đâu?",
                  a: "Khi hai đội đã chốt kèo, hệ thống tạo một Mã Bắt Tay 4 số ngẫu nhiên. Khi ra sân, Đội Khách mở app đọc mã cho Đội Nhà bấm xác nhận là tiền cọc tự động nhả về ví.",
                },
                {
                  q: "Gặp sự cố thì liên hệ ai hỗ trợ?",
                  a: "Hotline Zalo BQT trực ban: 0393.407.855 (hỗ trợ 24/7) hoặc bấm nút 'Tư Vấn Khách Hàng' ở góc dưới màn hình để hỏi Siêu Trợ Lý AI.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1"
                >
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="text-emerald-400">Q:</span>
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-slate-400 text-[11px] pl-4">{item.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={getZaloDeepLink(BQT_ZALO_PHONE)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <span>Zalo BQT: 0393.407.855</span>
              <ExternalLink className="w-3 h-3 text-sky-200" />
            </a>

            {onOpenSupport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSupport();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hỏi AI Trợ Lý</span>
              </button>
            )}
          </div>

          <Button
            onClick={onClose}
            className="px-5 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20"
          >
            <span>Đã Hiểu &amp; Trải Nghiệm Ngay</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
