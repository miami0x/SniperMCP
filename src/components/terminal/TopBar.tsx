'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Broadcast, Wallet, SignOut } from '@phosphor-icons/react';

interface TopBarProps {
  source: 'live' | 'fallback';
  activeRuleCount: number;
  poolCount: number;
}

export function TopBar({ source, activeRuleCount, poolCount }: TopBarProps) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className="relative z-10 flex items-center justify-between border-b border-white/[0.08] bg-black/40 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-baseline gap-4">
        <h1 className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-lg font-light tracking-[-0.03em] text-transparent">
          Sniper<span className="font-normal text-emerald-400">MCP</span>
        </h1>
        <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-light text-emerald-300 sm:inline">
          Robinhood Chain · 4663
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-5 text-xs font-light text-zinc-400 md:flex tabular-nums">
          <span className="flex items-center gap-1.5">
            <Broadcast
              weight="thin"
              className={`h-4 w-4 ${source === 'live' ? 'text-emerald-400' : 'text-zinc-500'}`}
            />
            {source === 'live' ? 'Live feed' : 'Simulated'}
          </span>
          <span className="text-zinc-700">/</span>
          <span>{poolCount} pools</span>
          <span className="text-zinc-700">/</span>
          <span className="text-emerald-300">{activeRuleCount} active rules</span>
        </div>

        {isConnected && address ? (
          <button
            onClick={() => disconnect()}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-xs font-light text-zinc-100 backdrop-blur-md transition hover:border-white/30 tabular-nums"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            {address.slice(0, 6)}…{address.slice(-4)}
            <SignOut weight="thin" className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        ) : (
          <button
            onClick={() => connect({ connector: injected() })}
            className="liquid-btn flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition"
          >
            <Wallet weight="regular" className="h-3.5 w-3.5" />
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
