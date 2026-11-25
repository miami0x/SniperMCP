'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Crosshair, Radio, Wallet, LogOut } from 'lucide-react';

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
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 bg-[#050505] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <Crosshair className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-base font-bold tracking-wider text-zinc-100">
              SNIPER<span className="text-cyan-400">MCP</span>
            </h1>
            <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
              ROBINHOOD L2 · 4663
            </span>
          </div>
          <p className="text-xs text-zinc-500">Zero-setup AI trench terminal & stock-pair radar</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-4 rounded-lg border border-zinc-800 bg-[#0a0a0a] px-3 py-1.5 font-mono text-xs md:flex">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Radio className={`h-3.5 w-3.5 ${source === 'live' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            {source === 'live' ? 'LIVE FEED' : 'FALLBACK FEED'}
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-300">{poolCount} POOLS</span>
          <span className="text-zinc-700">|</span>
          <span className="text-cyan-400">{activeRuleCount} ACTIVE RULES</span>
        </div>

        {isConnected && address ? (
          <button
            onClick={() => disconnect()}
            className="flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 font-mono text-xs text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {address.slice(0, 6)}...{address.slice(-4)}
            <LogOut className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        ) : (
          <button
            onClick={() => connect({ connector: injected() })}
            className="flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-400/15 px-3.5 py-2 font-mono text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/25"
          >
            <Wallet className="h-3.5 w-3.5" />
            CONNECT WALLET
          </button>
        )}
      </div>
    </header>
  );
}
