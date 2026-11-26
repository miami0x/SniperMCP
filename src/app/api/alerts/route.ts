import { NextResponse } from 'next/server';
import { db } from '@/db';
import { telegramSubscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

async function sendTelegramMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) return { ok: false, skipped: true };
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = (searchParams.get('wallet') || 'guest').toLowerCase();

  const [sub] = await db
    .select()
    .from(telegramSubscribers)
    .where(eq(telegramSubscribers.walletAddress, wallet))
    .limit(1);

  return NextResponse.json({
    connected: Boolean(sub),
    username: sub?.username || null,
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  // 1. Incoming Telegram Bot Webhook (/start <walletAddress>)
  if (body?.message?.chat?.id && typeof body?.message?.text === 'string') {
    const chatId = String(body.message.chat.id);
    const username = body.message.from?.username || null;
    const text = body.message.text.trim();

    if (text.startsWith('/start')) {
      const parts = text.split(/\s+/);
      const wallet = (parts[1] || 'guest').toLowerCase();

      await db
        .insert(telegramSubscribers)
        .values({ walletAddress: wallet, chatId, username })
        .onConflictDoUpdate({
          target: telegramSubscribers.walletAddress,
          set: { chatId, username },
        });

      await sendTelegramMessage(
        chatId,
        `<b>SniperMCP Alerts Linked</b>\nWallet: <code>${wallet}</code>\n\nYou will receive instant pings whenever a new Robinhood Chain pool matches your active rules.`
      );
    }

    return NextResponse.json({ ok: true });
  }

  // 2. Outbound Rule-Match / Test Alert Dispatch
  if (body?.action === 'notify') {
    const wallet = (body.walletAddress || 'guest').toLowerCase();
    const [sub] = await db
      .select()
      .from(telegramSubscribers)
      .where(eq(telegramSubscribers.walletAddress, wallet))
      .limit(1);

    if (!sub) {
      return NextResponse.json({ ok: false, error: 'Telegram not connected' }, { status: 404 });
    }

    const msg = `<b>${body.title || 'SniperMCP Alert'}</b>\n${body.message || ''}`;
    const result = await sendTelegramMessage(sub.chatId, msg);
    return NextResponse.json({ ok: true, result });
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
