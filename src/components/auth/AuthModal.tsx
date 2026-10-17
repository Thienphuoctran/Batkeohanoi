"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { signInWithEmailAction, signUpWithEmailAction } from "@/actions/auth";
import {
  LogIn,
  UserPlus,
  X,
  Mail,
  Lock,
  Phone,
  User,
  ShieldCheck,
} from "lucide-react";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = "login",
}) => {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "Chức năng Google OAuth cần bật trên Supabase Dashboard. Bạn có thể đăng ký nhanh bằng SĐT & Email ngay bên dưới!"
      );
      setLoading(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res =
      mode === "login"
        ? await signInWithEmailAction(formData)
        : await signUpWithEmailAction(formData);

    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-pitch-600 to-emerald-400 text-white shadow-lg shadow-pitch-600/30 mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-white">
            {mode === "login"
              ? "Đăng Nhập Đội Trưởng"
              : "Đăng Ký Đội Trưởng Mới"}
          </h2>
          <p className="text-xs text-slate-400">
            Xác thực danh tính minh bạch 1 SĐT = 1 Đội để bắt đối và bảo vệ
            100 điểm tín nhiệm
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow transition-all active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Tiếp tục với Google (1-chạm)</span>
        </button>

        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span>HOẶC SĐT ZALO &amp; EMAIL</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`py-1.5 rounded-lg font-bold transition-all ${
              mode === "login"
                ? "bg-pitch-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage(null);
            }}
            className={`py-1.5 rounded-lg font-bold transition-all ${
              mode === "register"
                ? "bg-pitch-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Tạo tài khoản
          </button>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-700/60 text-red-300 text-xs leading-relaxed">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-slate-400 mb-1">
                  Họ và tên Đội trưởng:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="VD: Hoàng Văn Nam"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:border-pitch-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Số điện thoại Zalo chính chủ:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="VD: 0912345678 (Gắn cố định với 1 đội)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-mono focus:border-pitch-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-amber-400/90 mt-1 block">
                  * 1 Số điện thoại chỉ tạo được 1 đội bóng duy nhất để chống
                  bùng kèo ảo.
                </span>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-400 mb-1">
              {mode === "login"
                ? "Email hoặc Số điện thoại Zalo:"
                : "Email Đội trưởng:"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={mode === "login" ? "text" : "email"}
                name="email"
                required
                placeholder={
                  mode === "login"
                    ? "Nhập SĐT (098...) hoặc Email"
                    : "doitruong@gmail.com"
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:border-pitch-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Mật khẩu:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:border-pitch-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-pitch-600 hover:bg-pitch-500 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-pitch-600/30 transition-all flex items-center justify-center space-x-1.5"
          >
            {loading ? (
              <span>Đang xử lý...</span>
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Vào Hệ Thống</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Xác Nhận &amp; Tiếp Tục Tạo Đội</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
