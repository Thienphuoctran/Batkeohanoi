"use server";

export async function sendTelegramAlert(text: string, chatId?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const targetChatId = chatId || process.env.TELEGRAM_DEFAULT_CHAT_ID;

  if (!token || !targetChatId) {
    console.warn("[Telegram Alert] Thiếu BOT_TOKEN hoặc CHAT_ID trong .env.local");
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[Telegram Alert Error]", err);
    return false;
  }
}
