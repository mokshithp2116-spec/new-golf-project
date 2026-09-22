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
    // Retrieve and sanitize environment variables (removing accidental quotes/whitespace)
    const rawToken = process.env.TELEGRAM_BOT_TOKEN?.trim().replace(/^["']|["']$/g, '');
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim().replace(/^["']|["']$/g, '');

    const hasToken = Boolean(rawToken && rawToken.length > 0);
    const hasChatId = Boolean(chatId && chatId.length > 0);

    if (!hasToken || !hasChatId) {
      console.warn(
        `[Telegram] Notification skipped due to missing environment variables. (TELEGRAM_BOT_TOKEN: ${
          hasToken ? 'PRESENT' : 'MISSING'
        }, TELEGRAM_CHAT_ID: ${hasChatId ? 'PRESENT' : 'MISSING'})`
      );
      return;
    }

    // Strip duplicate 'bot' prefix if user included 'bot' in TELEGRAM_BOT_TOKEN env variable
    const botToken = rawToken!.startsWith('bot') ? rawToken!.slice(3) : rawToken!;

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

    // Timeout after 5 seconds to prevent serverless function hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[Telegram] API request failed with HTTP ${res.status}: ${errorText}`
      );
    } else {
      console.log('[Telegram] Admin login notification sent successfully.');
    }
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    if (err?.name === 'AbortError') {
      console.error('[Telegram] Notification request timed out after 5000ms.');
    } else {
      console.error('[Telegram] Unexpected error while sending notification:', err?.message || error);
    }
  }
}
