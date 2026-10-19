"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Scale,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Gavel,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Search,
  BookOpen,
  Flame,
  Users,
  Award,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlatformRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport?: () => void;
}

type RuleCategory = "ALL" | "MATCH" | "PENALTY" | "ESCROW" | "SOS" | "MARKET" | "APPEAL";

interface PenaltyItem {
  violation: string;
  category: "Hủy Kèo" | "Giờ Giấc" | "Hành Vi" | "Chợ Cầu";
  pointsDeducted: string;
  financialPenalty: string;
  accountAction: string;
  severity: "low" | "medium" | "high" | "critical";
}

const PENALTY_MATRIX: PenaltyItem[] = [
  {
    violation: "Đơn phương bùng kèo / Không đến sân mà không báo trước",
    category: "Hủy Kèo",
    pointsDeducted: "-30 Điểm",
    financialPenalty: "Tịch thu 200.000đ cọc (Bồi thường cho đối thủ)",
    accountAction: "Gắn nhãn đỏ 'TỪNG BÙNG KÈO', bắt buộc ký quỹ 100%",
    severity: "critical",
  },
  {
    violation: "Hủy kèo sát giờ bóng lăn (< 2 tiếng trước trận)",
    category: "Hủy Kèo",
    pointsDeducted: "-25 Điểm",
    financialPenalty: "Bồi thường 200.000đ phí đặt sân cho đội đối tác",
    accountAction: "Hạ cấp tín nhiệm, cảnh cáo hệ thống",
    severity: "high",
  },
  {
    violation: "Hủy kèo từ 2h - 4h trước trận (Đội khách không đồng thuận)",
    category: "Hủy Kèo",
    pointsDeducted: "-15 Điểm",
    financialPenalty: "Bồi thường 100.000đ tiền nước",
    accountAction: "Lưu lịch sử vi phạm",
    severity: "medium",
  },
  {
    violation: "Hủy kèo hợp lệ trước > 4 tiếng (hoặc đồng thuận 2 bên)",
    category: "Hủy Kèo",
    pointsDeducted: "0 Điểm (Miễn phạt)",
    financialPenalty: "Hoàn cọc 100% về ví",
    accountAction: "Không áp dụng chế tài",
    severity: "low",
  },
  {
    violation: "Đến muộn quá 15 phút ảnh hưởng thời gian thi đấu của đối thủ",
    category: "Giờ Giấc",
    pointsDeducted: "-10 Điểm",
    financialPenalty: "Bù 50.000đ tiền nước cho đội bạn",
    accountAction: "Nhắc nhở nội quy",
    severity: "medium",
  },
  {
    violation: "Gian lận trình độ (Đội Tier 3 đăng ký đá kèo Tier 1 để 'chặt chém')",
    category: "Hành Vi",
    pointsDeducted: "-20 Điểm",
    financialPenalty: "Không phạt tiền",
    accountAction: "Tự động khóa chuyển sang đúng Tier 3 trong 30 ngày",
    severity: "high",
  },
  {
    violation: "Hành vi bạo lực sân cỏ, xô xát, phi thể thao nghiêm trọng",
    category: "Hành Vi",
    pointsDeducted: "-100 Điểm (Về 0)",
    financialPenalty: "Khóa vĩnh viễn tài khoản & số dư ví",
    accountAction: "Đưa vào Danh sách đen (Blacklist) toàn bộ hệ thống sân phủi",
    severity: "critical",
  },
  {
    violation: "Cầu thủ tự do nhận lời đi đá bù nhưng bùng hẹn phút chót",
    category: "Chợ Cầu",
    pointsDeducted: "-25 Điểm",
    financialPenalty: "Không phạt tiền",
    accountAction: "Khóa quyền đăng hồ sơ Chợ Cầu 14 ngày",
    severity: "high",
  },
  {
    violation: "Đội tuyển người nhưng từ chối thanh toán hoặc quỵt tiền sân của cầu thủ",
    category: "Chợ Cầu",
    pointsDeducted: "-30 Điểm",
    financialPenalty: "Khóa ví ký quỹ",
    accountAction: "Cấm đăng bài tuyển quân vĩnh viễn",
    severity: "critical",
  },
];

export function PlatformRulesModal({
  isOpen,
  onClose,
  onOpenSupport,
}: PlatformRulesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPenalties = useMemo(() => {
    return PENALTY_MATRIX.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.violation.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.pointsDeducted.toLowerCase().includes(q) ||
        item.financialPenalty.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (selectedCategory === "MATCH" && item.category !== "Hủy Kèo") return false;
      if (selectedCategory === "PENALTY" && item.severity !== "critical" && item.severity !== "high") return false;
      if (selectedCategory === "MARKET" && item.category !== "Chợ Cầu") return false;

      return true;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B1120] border border-slate-700/80 w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Bảng Nội Quy &amp; Quy Chế Kỷ Luật BắtKèo7
                </h2>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-black uppercase">
                  Quy Chuẩn 2026
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Bộ quy tắc ứng xử văn minh sân phủi, chế tài chống bùng kèo &amp; cơ chế bảo vệ quyền lợi 100%
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

        {/* Thanh tìm kiếm & Lọc chuyên mục */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm lỗi vi phạm, mức phạt, tiền cọc..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
              {[
                { id: "ALL", label: "Tất cả quy chế" },
                { id: "MATCH", label: "Hủy & Bùng Kèo" },
                { id: "PENALTY", label: "Vi Phạm Nặng" },
                { id: "MARKET", label: "Chợ Cầu Lẻ" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as RuleCategory)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === tab.id
                      ? "bg-amber-400 text-slate-950 font-black shadow-md"
                      : "bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Thân Nội Dung Có Cuộn */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* PHẦN 1: BẢNG MA TRẬN KỶ LUẬT & HÌNH THỨC XỬ PHẠT (BẢNG TRỰC QUAN) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <Gavel className="w-4 h-4" />
                <span>BẢNG MA TRẬN CHẾ TÀI &amp; MỨC XỬ PHẠT MINH BẠCH</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Tìm thấy {filteredPenalties.length} quy chuẩn
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/80 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-black text-slate-300 uppercase tracking-wider">
                      <th className="py-3 px-3.5">Hành Vi Vi Phạm</th>
                      <th className="py-3 px-3">Phân Loại</th>
                      <th className="py-3 px-3">Trừ Điểm Uy Tín</th>
                      <th className="py-3 px-3.5">Bồi Thường Tài Chính</th>
                      <th className="py-3 px-3.5">Biện Pháp Kỷ Luật</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filteredPenalties.map((item, idx) => {
                      const isCrit = item.severity === "critical";
                      const isHigh = item.severity === "high";
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-900/50 transition ${
                            isCrit ? "bg-rose-950/20" : isHigh ? "bg-amber-950/15" : ""
                          }`}
                        >
                          <td className="py-3 px-3.5 font-bold text-white max-w-xs">
                            <div className="flex items-start gap-1.5">
                              {isCrit ? (
                                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              ) : isHigh ? (
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              )}
                              <span>{item.violation}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-black text-rose-400">
                            {item.pointsDeducted}
                          </td>
                          <td className="py-3 px-3.5 text-slate-200">
                            {item.financialPenalty}
                          </td>
                          <td className="py-3 px-3.5 text-slate-300 text-[11px]">
                            {item.accountAction}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* PHẦN 2: 5 ĐIỀU NỘI QUY CỐT LÕI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* ĐIỀU 1: HỆ THỐNG ĐIỂM TÍN NHIỆM */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-300 font-black text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>ĐIỀU 1: THANG ĐIỂM TÍN NHIỆM (0 - 100★)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                <li><strong className="text-emerald-300">100 Điểm (Khởi tạo):</strong> Miễn cọc tiền mặt, đăng và bắt kèo không giới hạn, được quyền rút tiền ví ký quỹ.</li>
                <li><strong className="text-amber-300">70 - 99 Điểm:</strong> Mức tiêu chuẩn phong trào.</li>
                <li><strong className="text-rose-400">Dưới 70 Điểm:</strong> Bị hạn chế tạo và nhận kèo, bắt buộc ký quỹ 200.000đ để bảo chứng cho mỗi trận đấu.</li>
                <li><strong className="text-red-500">Dưới 30 Điểm:</strong> Gắn nhãn đỏ cảnh báo "TỪNG BÙNG KÈO", tạm khóa tài khoản 14 ngày.</li>
              </ul>
            </div>

            {/* ĐIỀU 2: GIỜ GIẤC & MÃ BẮT TAY */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-950/15 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-blue-300 font-black text-sm">
                <Clock className="w-4 h-4" />
                <span>ĐIỀU 2: GIỜ GIẤC &amp; MÃ BẮT TAY 4 SỐ</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Có mặt tại sân bóng trước giờ bóng lăn tối thiểu <strong>15 phút</strong> để khởi động và thống nhất màu áo thi đấu.</li>
                <li>Hai đội gặp nhau tại sân mở app nhập <strong>Mã Bắt Tay 4 Số</strong>: Xác thực thi đấu văn minh thành công, tự động nhả 100% tiền cọc và thưởng ngay <strong>+10 Điểm Tín Nhiệm</strong>.</li>
                <li>Trường hợp đối phương không đến, bật xác thực <strong>GPS tại sân</strong> để nhận bồi thường 200.000đ từ ví của đối thủ.</li>
              </ul>
            </div>

            {/* ĐIỀU 3: KÈO CỨU HỘ SOS */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-300 font-black text-sm">
                <Flame className="w-4 h-4" />
                <span>ĐIỀU 3: QUY CHẾ KÈO CỨU HỘ SOS (&lt; 2H)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Chỉ kích hoạt khi trận đấu sắp diễn ra trong vòng 2 tiếng hoặc bị đối thủ bùng kèo phút chót.</li>
                <li>Đội bóng nào đến giải cứu kèo SOS thành công được cộng ngay <strong>+8 Điểm Tín Nhiệm</strong> vào thẻ căn cước đội.</li>
                <li>Kèo SOS được hệ thống ưu tiên ghim trên đầu bảng tin và giữ hiệu lực 90 phút sau giờ bóng lăn.</li>
              </ul>
            </div>

            {/* ĐIỀU 4: CHỢ CẦU LẺ & CẦU THỦ TỰ DO */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                <Users className="w-4 h-4" />
                <span>ĐIỀU 4: NỘI QUY CHỢ CẦU &amp; CẦU THỦ PHỦI</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Cầu thủ tự do nhận đi đá phải đến đúng giờ, thi đấu nhiệt tình và đóng góp tiền sân nước văn minh.</li>
                <li>Đội bóng tuyển người có trách nhiệm bảo đảm an toàn, hỗ trợ hòa nhập cho cầu thủ khách mời.</li>
                <li><strong>Chính chủ:</strong> Cầu thủ và Đội bóng chỉ có quyền sửa hoặc xóa bài do chính mình đăng bằng số điện thoại chính chủ.</li>
              </ul>
            </div>
          </div>

          {/* PHẦN 3: CƠ CHẾ KHÁNG CÁO & GIẢI OAN BẤT KHẢ KHÁNG */}
          <section className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/30 via-slate-900 to-indigo-950/30 p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-black text-sm">
              <Award className="w-4 h-4" />
              <span>ĐIỀU 5: CƠ CHẾ KHÁNG CÁO GIẢI OAN KHI GẶP SỰ CỐ BẤT KHẢ KHÁNG</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nếu đội bạn không thể đến sân do các lý do bất khả kháng (Mưa bão ngập sân, sự cố tai nạn giao thông trên đường, sân bóng bị mất điện/cắt điện), Đội trưởng có quyền gửi <strong>Đơn Kháng Cáo</strong> kèm hình ảnh bằng chứng lên Ban Quản Trị qua mục Hủy Kèo.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold">
                ✓ Phê duyệt giải oan trong 15 phút
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                ✓ Khôi phục 100/100 điểm tín nhiệm
              </span>
              <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold">
                ✓ Hoàn trả 100% tiền cọc ví ký quỹ
              </span>
            </div>
          </section>

        </div>

        {/* Footer Modal */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            Mọi thắc mắc hoặc cần hỗ trợ giải quyết tranh chấp sân phủi, liên hệ trực tiếp BQT.
          </p>
          <div className="flex items-center gap-2">
            {onOpenSupport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenSupport();
                }}
                className="h-9 rounded-xl border-slate-700 text-slate-300 hover:text-white text-xs font-bold gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Liên Hệ Trợ Lý AI</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={onClose}
              className="h-9 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20"
            >
              Tôi Đã Nắm Rõ Nội Quy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
