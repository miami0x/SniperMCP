'use client';

import { useEffect, useState } from 'react';

interface TelegramAlertBarProps {
  walletKey: string;
}

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'SniperMCPBot';

export function TelegramAlertBar({ walletKey }: TelegramAlertBarProps) {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/alerts?wallet=${encodeURIComponent(walletKey)}`)
      .then((r) => r.json())
      .then((d) => {
        setConnected(Boolean(d.connected));
        setUsername(d.username || null);
      })
      .catch(() => {});
  }, [walletKey]);

  async function handleTestPing() {
    setTesting(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notify',
          walletAddress: walletKey,
          title: 'SniperMCP Test Ping',
          message: 'Your Robinhood Chain rule alerts are live.',
        }),
      });
      setStatusMsg(res.ok ? 'Ping sent' : 'Connect bot first');
    } finally {
      setTesting(false);
    }
  }

  const deepLink = `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(walletKey)}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] bg-white/[0.015] px-4 py-2 text-xs">
      <div className="flex items-center gap-2 text-zinc-400">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            connected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-zinc-600'
          }`}
        />
        <span className="font-light">
          Telegram Alerts:{' '}
          <span className="text-zinc-200">
            {connected ? `Connected${username ? ` (@${username})` : ''}` : 'Not linked'}
          </span>
        </span>
        {statusMsg && <span className="text-emerald-400">· {statusMsg}</span>}
      </div>

      <div className="flex items-center gap-2">
        {connected ? (
          <button
            onClick={handleTestPing}
            disabled={testing}
            className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-40"
          >
            {testing ? 'Sending…' : 'Send Test Ping'}
          </button>
        ) : (
          <a
            href={deepLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] text-white transition hover:border-emerald-400/40 hover:text-emerald-300"
          >
            Connect @{BOT_USERNAME} ↗
          </a>
        )}
      </div>
    </div>
  );
}
