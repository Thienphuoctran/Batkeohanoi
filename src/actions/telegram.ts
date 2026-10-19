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

    if (!res.ok) {
      // 🛡️ BẢO MẬT MỤC 15: Thoát ký tự HTML an toàn, tự động thử lại bằng plain-text
      const plainText = text.replace(/<[^>]*>/g, "");
      const retryRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: plainText,
          disable_web_page_preview: true,
        }),
      });
      return retryRes.ok;
    }
    return true;
  } catch (err) {
    console.error("[Telegram Alert Error]", err);
    return false;
  }
}

export async function sendTelegramPhoto(
  photoUrl: string,
  caption: string,
  chatId?: string
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const targetChatId = chatId || process.env.TELEGRAM_DEFAULT_CHAT_ID;

  if (!token || !targetChatId) {
    console.warn("[Telegram Photo] Thiếu BOT_TOKEN hoặc CHAT_ID trong .env.local");
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendPhoto`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: "HTML",
      }),
    });

    if (res.ok) {
      return true;
    }

    const errDetail = await res.text();
    console.warn("[Telegram sendPhoto Error, fallback to sendMessage]", errDetail);
    return await sendTelegramAlert(caption, targetChatId);
  } catch (err) {
    console.error("[Telegram sendPhoto Error, fallback to text]", err);
    return await sendTelegramAlert(caption, targetChatId);
  }
}
