"use client";

import React, { useState, useEffect } from "react";
import { createTeamOnboardingAction } from "@/actions/auth";
import {
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";

export interface TeamOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (team: any) => void;
  initialCaptainName?: string;
  initialPhone?: string;
}

export const TeamOnboardingModal: React.FC<TeamOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCaptainName = "",
  initialPhone = "",
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [captainName, setCaptainName] = useState(initialCaptainName);
  const [phone, setPhone] = useState(initialPhone);
  const [telegramChatId, setTelegramChatId] = useState("");

  const [teamName, setTeamName] = useState("");
  const [avgAge, setAvgAge] = useState(30);
  const [homeDistrict, setHomeDistrict] = useState("CauGiay");
  const [jerseyColor, setJerseyColor] = useState("Đỏ truyền thống");

  const [skillTier, setSkillTier] = useState<1 | 2 | 3>(2);
  const [bankAccountNo, setBankAccountNo] = useState("07440948327598");
  const [bankAccountName, setBankAccountName] = useState(
    "TRAN QUOC THIEN PHUOC"
  );
  const [bankCode, setBankCode] = useState("MB");
  const [fairplayPledge, setFairplayPledge] = useState(false);

  useEffect(() => {
    if (initialCaptainName) setCaptainName(initialCaptainName);
    if (initialPhone) setPhone(initialPhone);
  }, [initialCaptainName, initialPhone]);

  if (!isOpen) return null;

  const handleFinalSubmit = async () => {
    if (!fairplayPledge) {
      setErrorMsg(
        "Bạn vui lòng đọc và tích chọn cam kết Fair-play & Không bùng kèo."
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("captainName", captainName);
    formData.append("phone", phone);
    formData.append("telegramChatId", telegramChatId);
    formData.append("teamName", teamName);
    formData.append("avgAge", avgAge.toString());
    formData.append("homeDistrict", homeDistrict);
    formData.append("jerseyColor", jerseyColor);
    formData.append("skillTier", skillTier.toString());
    formData.append("bankAccountNo", bankAccountNo);
    formData.append("bankAccountName", bankAccountName);
    formData.append("bankCode", bankCode);

    const res = await createTeamOnboardingAction(formData);
    setLoading(false);

    if (res.success) {
      onSuccess(res.team);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between border-b border-slate-800 pb-3 pr-7">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pitch-400">
              Thiết Lập Đội Bóng Minh Bạch
            </span>
            <h3 className="text-sm font-extrabold text-white">
              Bước {step} / 3:{" "}
              {step === 1
                ? "Định Danh Đội Trưởng"
                : step === 2
                ? "Hồ Sơ Đội Bóng"
                : "Phân Tầng & Cam Kết"}
            </h3>
          </div>
          <div className="flex space-x-1.5">
            <span
              className={`w-6 h-1.5 rounded-full ${
                step >= 1 ? "bg-pitch-500" : "bg-slate-800"
              }`}
            ></span>
            <span
              className={`w-6 h-1.5 rounded-full ${
                step >= 2 ? "bg-pitch-500" : "bg-slate-800"
              }`}
            ></span>
            <span
              className={`w-6 h-1.5 rounded-full ${
                step === 3 ? "bg-pitch-500" : "bg-slate-800"
              }`}
            ></span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-700/60 text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">
                Họ tên Đội trưởng (Hiển thị cho đối thủ):
              </label>
              <input
                type="text"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                placeholder="VD: Hoàng Văn Nam"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-pitch-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Số điện thoại Zalo chính chủ (1 SĐT = 1 Đội):
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0988123456"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-pitch-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Đối thủ sẽ bấm gọi hoặc kết nối Zalo qua số này khi hai bên đã
                chốt kèo.
              </span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Chat ID Telegram (Nhận tin báo khẩn cấp - tùy chọn):
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="VD: 8332675283 (Gõ /id gửi @BatkeoHanoi_bot)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-pitch-500 focus:outline-none"
              />
              <span className="text-[10px] text-sky-400 mt-1 block">
                Mở bot Telegram <strong>@BatkeoHanoi_bot</strong> và gõ lệnh{" "}
                <code>/id</code> để lấy mã.
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!captainName || !phone) {
                  setErrorMsg("Vui lòng điền đủ họ tên và số điện thoại.");
                  return;
                }
                setErrorMsg(null);
                setStep(2);
              }}
              className="w-full py-2.5 bg-pitch-600 hover:bg-pitch-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
            >
              <span>Tiếp Tục Sang Bước 2</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">
                Tên đội bóng (FC):
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="VD: FC Dưỡng Sinh Duy Tân"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-pitch-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">
                  Độ tuổi trung bình:
                </label>
                <input
                  type="number"
                  min="16"
                  max="60"
                  value={avgAge}
                  onChange={(e) => setAvgAge(parseInt(e.target.value) || 28)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  Địa bàn đá chính:
                </label>
                <select
                  value={homeDistrict}
                  onChange={(e) => setHomeDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-pitch-500 focus:outline-none"
                >
                  <option value="CauGiay">Quận Cầu Giấy</option>
                  <option value="NamTuLiem">Quận Nam Từ Liêm</option>
                  <option value="ThanhXuan">Quận Thanh Xuân</option>
                  <option value="DongDa">Quận Đống Đa</option>
                  <option value="HaDong">Quận Hà Đông</option>
                  <option value="BacTuLiem">Quận Bắc Từ Liêm</option>
                  <option value="HoangMai">Quận Hoàng Mai</option>
                  <option value="BaDinh">Quận Ba Đình</option>
                  <option value="HaiBaTrung">Quận Hai Bà Trưng</option>
                  <option value="TayHo">Quận Tây Hồ</option>
                  <option value="LongBien">Quận Long Biên</option>
                  <option value="Other">Quận / Huyện khác (Hà Nội)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Màu áo truyền thống của đội (Chống trùng màu áo):
              </label>
              <select
                value={jerseyColor}
                onChange={(e) => setJerseyColor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-pitch-500 focus:outline-none"
              >
                <option value="Đỏ truyền thống">🔴 Áo Đỏ truyền thống</option>
                <option value="Xanh Dương">🔵 Áo Xanh Dương</option>
                <option value="Trắng">⚪ Áo Trắng</option>
                <option value="Vàng">🟡 Áo Vàng</option>
                <option value="Xanh Lá">🟢 Áo Xanh Lá</option>
                <option value="Đen">⚫ Áo Đen</option>
                <option value="Cam">🟠 Áo Cam</option>
              </select>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl flex items-center justify-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!teamName) {
                    setErrorMsg("Vui lòng nhập tên đội bóng.");
                    return;
                  }
                  setErrorMsg(null);
                  setStep(3);
                }}
                className="flex-1 py-2.5 bg-pitch-600 hover:bg-pitch-500 text-white font-bold rounded-xl flex items-center justify-center space-x-1"
              >
                <span>Tiếp Tục Sang Bước 3</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">
                Phân tầng trình độ tự nhận (Rất quan trọng):
              </label>
              <div className="space-y-1.5">
                <label
                  className={`block p-2.5 rounded-xl border cursor-pointer transition-all ${
                    skillTier === 1
                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-200"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="skillTierRadio"
                    checked={skillTier === 1}
                    onChange={() => setSkillTier(1)}
                    className="hidden"
                  />
                  <div className="font-bold text-emerald-400">
                    Tier 1: Dưỡng sinh (U32+ Dân văn phòng)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Đá nhẹ nhàng rèn sức khỏe, tuyệt đối cấm xoạc bóng, va chạm
                    mạnh.
                  </div>
                </label>

                <label
                  className={`block p-2.5 rounded-xl border cursor-pointer transition-all ${
                    skillTier === 2
                      ? "bg-blue-950/40 border-blue-500 text-blue-200"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="skillTierRadio"
                    checked={skillTier === 2}
                    onChange={() => setSkillTier(2)}
                    className="hidden"
                  />
                  <div className="font-bold text-blue-400">
                    Tier 2: Phong trào (Thanh niên trẻ)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Sinh viên &amp; thanh niên, thể lực tốt, đá nhiệt tình,
                    fair-play.
                  </div>
                </label>

                <label
                  className={`block p-2.5 rounded-xl border cursor-pointer transition-all ${
                    skillTier === 3
                      ? "bg-red-950/40 border-red-500 text-red-200"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="skillTierRadio"
                    checked={skillTier === 3}
                    onChange={() => setSkillTier(3)}
                    className="hidden"
                  />
                  <div className="font-bold text-red-400">
                    Tier 3: Phủi chiến (Cọ xát chuyên sâu)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Đội tập bài bản hàng tuần, cường độ cao, tìm đối cứng giao
                    lưu.
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 flex items-center">
                <CreditCard className="w-3.5 h-3.5 mr-1 text-pitch-400" />
                <span>Tài khoản nhận tiền sân VietQR &amp; Hoàn cọc:</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  placeholder="Số tài khoản"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px]"
                />
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                >
                  <option value="MB">MB Bank</option>
                  <option value="VCB">Vietcombank</option>
                  <option value="TCB">Techcombank</option>
                  <option value="BIDV">BIDV</option>
                </select>
              </div>
              <input
                type="text"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="Tên chủ tài khoản (In hoa không dấu)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px]"
              />
            </div>

            <label className="flex items-start space-x-2 bg-pitch-950/40 border border-pitch-600/50 p-2.5 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={fairplayPledge}
                onChange={(e) => setFairplayPledge(e.target.checked)}
                className="mt-0.5 rounded text-pitch-600 focus:ring-0"
              />
              <span className="text-[11px] text-slate-300 leading-relaxed">
                Đội cam kết thi đấu <strong>văn minh, đúng giờ</strong>, thanh
                toán sòng phẳng 50/50 qua VietQR, và tuân thủ chế tài trừ điểm
                nếu tự ý bùng kèo sát giờ (&lt; 1 tiếng).
              </span>
            </label>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl flex items-center justify-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 bg-gradient-to-r from-pitch-600 to-emerald-500 hover:from-pitch-500 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center space-x-1"
              >
                {loading ? (
                  <span>Đang khởi tạo...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hoàn Tất &amp; Nhận 100 Điểm Tín Nhiệm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
