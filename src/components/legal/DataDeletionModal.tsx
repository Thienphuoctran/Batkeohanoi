"use client";

import React, { useState } from "react";
import { X, Trash2, ShieldAlert, CheckCircle2, Mail, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName?: string;
  captainPhone?: string;
  captainEmail?: string;
}

export const DataDeletionModal: React.FC<DataDeletionModalProps> = ({
  isOpen,
  onClose,
  teamName = "Đội bóng của bạn",
  captainPhone = "",
  captainEmail = "",
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const mailSubject = encodeURIComponent(
    `[GiaoHuu.VN] Yêu cầu xóa dữ liệu cá nhân (NĐ 13) - Đội: ${teamName} (${captainPhone})`
  );
  const mailBody = encodeURIComponent(
    `Kính gửi Ban Quản Trị GiaoHuu.VN,\n\nTôi là Đội trưởng đội bóng: ${teamName}.\nSố điện thoại đăng ký: ${captainPhone}\nEmail: ${captainEmail}\n\nTheo quy định tại Điều 14 Nghị định 13/2023/NĐ-CP về Quyền xóa dữ liệu cá nhân, tôi yêu cầu Ban Quản Trị xóa vĩnh viễn toàn bộ thông tin tài khoản, hồ sơ đội bóng và lịch sử bắt kèo của tôi khỏi hệ thống máy chủ.\n\nLý do: ${reason || "Không còn nhu cầu sử dụng sàn."}\n\nXin cảm ơn!`
  );
  const mailtoLink = `mailto:phuocct998@gmail.com?subject=${mailSubject}&body=${mailBody}`;
  const zaloBqtLink = "https://zalo.me/0393407855";

  const handleFakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="card-retro-paper bg-[#fbf9f4] border-2 border-stone-800 w-full max-w-lg rounded-2xl sm:rounded-3xl overflow-hidden shadow-paper text-stone-900 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-300 bg-[#ede8dc] flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-headline text-base sm:text-lg font-black text-stone-900">
              Yêu Cầu Xóa Dữ Liệu Cá Nhân
            </h2>
            <p className="text-xs text-stone-600 font-mono">
              Quyền của chủ thể dữ liệu — Điều 14 Nghị định 13/2023/NĐ-CP
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs leading-relaxed text-stone-700">
          {!submitted ? (
            <>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1 text-amber-950">
                <span className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  Lưu ý trước khi thực hiện:
                </span>
                <p className="text-[11px] leading-relaxed">
                  Khi yêu cầu xóa dữ liệu được thực thi, toàn bộ số điện thoại liên kết, hồ sơ đội <strong>{teamName}</strong>, điểm tín nhiệm và thẻ cầu thủ sẽ bị xóa vĩnh viễn khỏi máy chủ trong vòng <strong>72 giờ làm việc</strong> và không thể khôi phục.
                </p>
              </div>

              <form onSubmit={handleFakeSubmit} className="space-y-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Số điện thoại định danh đội:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={captainPhone || "Tài khoản hiện tại"}
                    className="w-full bg-[#ede8dc] border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Lý do yêu cầu xóa dữ liệu (tùy chọn):
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="VD: Đội bóng đã giải tán, chuyển sang địa bàn khác..."
                    className="w-full bg-[#fbf9f4] border border-stone-300 rounded-xl p-2.5 text-stone-900 text-xs focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href={mailtoLink}
                    className="btn-paper-tactile h-9 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Gửi Email BQT (Mở Mail)</span>
                  </a>

                  <a
                    href={zaloBqtLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-paper-tactile h-9 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    <span>Nhắn Zalo BQT (0393.407.855)</span>
                  </a>
                </div>
              </form>
            </>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-base font-black text-stone-900">
                Đã Tiếp Nhận Yêu Cầu Xóa Dữ Liệu
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Yêu cầu hủy định danh và xóa toàn bộ dữ liệu cá nhân của đội <strong>{teamName}</strong> đã được ghi nhận. Ban Quản Trị sẽ đối soát và xử lý trong vòng 72 giờ làm việc.
              </p>
              <Button
                size="sm"
                onClick={onClose}
                className="btn-paper-tactile px-5 bg-stone-900 text-amber-300 font-bold rounded-xl"
              >
                Đã hiểu &amp; Đóng
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
