export interface TelegramLoginNotificationParams {
  name: string;
  email: string;
  ip?: string;
}

/**
 * Sends a server-side Telegram notification on successful admin login.
 * Uses TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.
 * 
 * Never throws exceptions - failures are caught and logged so login proceeds unaffected.
 */
export async function sendTelegramAdminLoginNotification({
  name,
  email,
  ip,
}: TelegramLoginNotificationParams): Promise<void> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn(
        '[Telegram] Notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variable is missing.'
      );
      return;
    }

    const timeString = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'UTC',
    });

    const ipAddress = ip && ip.trim() !== '' ? ip.trim() : 'Unknown';

    const message = [
      '🔐 ADMIN LOGIN',
      `👤 Name: ${name}`,
      `📧 Email: ${email}`,
      `🕒 Time: ${timeString}`,
      `🌐 IP: ${ipAddress}`,
    ].join('\n');

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    if (!res.ok) {
      const errorResponse = await res.text();
      console.error(
        `[Telegram] Failed to send notification. Status: ${res.status}, Response: ${errorResponse}`
      );
    }
  } catch (error) {
    console.error('[Telegram] Unexpected error while sending login notification:', error);
  }
}
