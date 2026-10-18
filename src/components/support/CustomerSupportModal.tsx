"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Phone,
  ShieldCheck,
  Wallet,
  MapPin,
  ExternalLink,
  ChevronRight,
  Flame,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { askBatKeoAiAssistantAction, ChatMessageItem } from "@/actions/aiAssistant";
import { getZaloDeepLink } from "@/lib/zalo";

const BQT_ZALO_PHONE = "0744094832"; // Hotline Zalo BQT BắtKèo7

interface MessageUIItem {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
  actions?: {
    label: string;
    actionType: "OPEN_WALLET" | "OPEN_PITCH_MAP" | "OPEN_SUB_MARKET" | "OPEN_ZALO" | "OPEN_SOS";
    payload?: string;
  }[];
}

const QUICK_PROMPTS = [
  "🛡️ Cọc 200k rút thế nào?",
  "⚠️ Bị đối bùng ai đền tiền?",
  "🌧️ Mưa to hủy kèo sao?",
  "🧤 Thuê thủ môn (GK) ở đâu?",
  "🏟️ Sân bóng nào ở Cầu Giấy?",
];

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWallet?: () => void;
  onSelectTab?: (tab: string) => void;
}

export function CustomerSupportModal({
  isOpen,
  onClose,
  onOpenWallet,
  onSelectTab,
}: CustomerSupportModalProps) {
  const [messages, setMessages] = useState<MessageUIItem[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      text: "Xin chào anh em Đội trưởng & Cầu thủ phủi Hà Nội! ⚽\nTôi là **BắtKèo7 AI Agent**, túc trực 24/7 để giải đáp mọi thắc mắc về quy chế cọc 200k, bùng kèo, tìm sân và cứu hộ giờ vàng. Bạn cần hỗ trợ gì cứ nhắn tôi nhé!",
      time: "Vừa xong",
      actions: [
        { label: "💬 Chat Zalo Trực Tiếp BQT", actionType: "OPEN_ZALO" },
        { label: "💼 Mở Ví Ký Quỹ", actionType: "OPEN_WALLET" },
      ],
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputQuestion.trim();
    if (!textToSend || isThinking) return;

    const userMsg: MessageUIItem = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputQuestion("");
    setIsThinking(true);

    try {
      const historyPayload: ChatMessageItem[] = messages.slice(-4).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await askBatKeoAiAssistantAction({
        question: textToSend,
        history: historyPayload,
      });

      const aiMsg: MessageUIItem = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: res.reply,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        actions: res.suggestedActions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          text: "Hệ thống AI đang phản hồi nhiều yêu cầu. Bạn có thể bấm nút bên dưới để chat trực tiếp với Ban Quản Trị qua Zalo nhé!",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          actions: [{ label: "💬 Chat Zalo Với BQT", actionType: "OPEN_ZALO" }],
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExecuteAction = (actionType: string) => {
    if (actionType === "OPEN_ZALO") {
      window.open(getZaloDeepLink(BQT_ZALO_PHONE), "_blank");
    } else if (actionType === "OPEN_WALLET") {
      onClose();
      onOpenWallet?.();
    } else if (actionType === "OPEN_PITCH_MAP") {
      onClose();
      onSelectTab?.("pitch-map");
    } else if (actionType === "OPEN_SUB_MARKET") {
      onClose();
      onSelectTab?.("sub-market");
    } else if (actionType === "OPEN_SOS") {
      onClose();
      onSelectTab?.("sos");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-950 border border-emerald-500/35 w-full max-w-lg rounded-t-3xl sm:rounded-3xl flex flex-col h-[88vh] sm:h-[680px] shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 p-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-slate-950">
                <Bot className="w-5 h-5 fill-current" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-tight">
                  BắtKèo7 AI Agent
                </h3>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] font-extrabold px-1.5 py-0">
                  ONLINE 24/7
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Trợ lý giải đáp quy chế cọc, bùng kèo &amp; cứu hộ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getZaloDeepLink(BQT_ZALO_PHONE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition"
              title="Mở ứng dụng Zalo chat trực tiếp với BQT"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xs:inline">Zalo BQT</span>
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-slate-900/70 border-b border-slate-800/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-black shrink-0 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Gợi ý:
          </span>
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={isThinking}
              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-medium whitespace-nowrap transition active:scale-95 disabled:opacity-50 shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-[#060913] to-slate-950 text-xs"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 space-y-2 leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-medium rounded-tr-sm"
                    : "bg-slate-900/95 border border-slate-800 text-slate-200 rounded-tl-sm"
                }`}
              >
                <div className="whitespace-pre-line text-xs font-normal">
                  {m.text}
                </div>

                {m.actions && m.actions.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {m.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleExecuteAction(act.actionType)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <span>{act.label}</span>
                        <ChevronRight className="w-3 h-3 text-emerald-400" />
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[9px] text-right ${
                    m.role === "user" ? "text-emerald-100/70" : "text-slate-500"
                  }`}
                >
                  {m.time}
                </div>
              </div>

              {m.role === "user" && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-2.5 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Trợ lý AI đang tra cứu quy chế &amp; soạn câu trả lời...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 space-y-2 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Hỏi AI bất kỳ điều gì (VD: Đội bùng kèo xử lý sao?)..."
              disabled={isThinking}
              className="bg-slate-900 border-slate-800 text-xs text-white placeholder:text-slate-500 rounded-xl h-10 focus:border-emerald-500"
            />
            <Button
              type="submit"
              disabled={!inputQuestion.trim() || isThinking}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black shadow-md shadow-emerald-500/20 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>💡 AI trả lời tức thì 24/7</span>
            <span>
              Hotline Zalo BQT:{" "}
              <a
                href={getZaloDeepLink(BQT_ZALO_PHONE)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 font-bold hover:underline"
              >
                0744.094.832
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
