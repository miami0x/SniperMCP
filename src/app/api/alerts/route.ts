import { NextResponse } from 'next/server';
import { db } from '@/db';
import { telegramSubscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

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

  if (wallet === 'guest') {
    return NextResponse.json({ connected: false, username: null });
  }

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

  // 1. Incoming Telegram Bot Webhook (/start <0x...> OR raw 0x... wallet address)
  if (body?.message?.chat?.id && typeof body?.message?.text === 'string') {
    const chatId = String(body.message.chat.id);
    const username = body.message.from?.username || null;
    const text = body.message.text.trim();

    let candidateWallet: string | null = null;

    if (text.startsWith('/start') || text.startsWith('/link')) {
      const parts = text.split(/\s+/);
      if (parts[1] && WALLET_REGEX.test(parts[1])) {
        candidateWallet = parts[1].toLowerCase();
      }
    } else if (WALLET_REGEX.test(text)) {
      candidateWallet = text.toLowerCase();
    }

    if (candidateWallet) {
      await db
        .insert(telegramSubscribers)
        .values({ walletAddress: candidateWallet, chatId, username })
        .onConflictDoUpdate({
          target: telegramSubscribers.walletAddress,
          set: { chatId, username },
        });

      await sendTelegramMessage(
        chatId,
        `<b>SniperMCP Alerts Linked</b>\nWallet: <code>${candidateWallet}</code>\n\nYou will receive instant pings whenever a new Robinhood Chain pool matches your active rules.`
      );
    } else if (text.startsWith('/start')) {
      await sendTelegramMessage(
        chatId,
        `<b>Welcome to SniperMCP Alerts</b>\n\nPaste your <code>0x...</code> wallet address here to link your terminal and start receiving live Robinhood Chain pool triggers.`
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
