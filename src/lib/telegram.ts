const BOT_TOKEN = import.meta.env.VITE_TG_BOT_TOKEN as string
const CHAT_ID = import.meta.env.VITE_TG_CHAT_ID as string

export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    // Dev fallback: log to console
    console.warn('[Telegram] Bot not configured. Message:\n', text)
    return true
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: 'HTML',
        }),
      }
    )
    return res.ok
  } catch {
    return false
  }
}
