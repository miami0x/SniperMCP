'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

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
    <header className="flex items-center justify-between border-b border-white/[0.08] bg-black px-6 py-4">
      <div className="flex items-baseline gap-4">
        <h1 className="text-lg font-light tracking-[-0.03em] text-white">
          Sniper<span className="text-zinc-500">MCP</span>
        </h1>
        <span className="hidden text-xs font-light text-zinc-500 sm:inline">
          Robinhood Chain · 4663
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-5 text-xs font-light text-zinc-400 md:flex tabular-nums">
          <span className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                source === 'live' ? 'bg-emerald-400' : 'bg-zinc-500'
              }`}
            />
            {source === 'live' ? 'Live feed' : 'Simulated feed'}
          </span>
          <span className="text-zinc-700">/</span>
          <span>{poolCount} pools</span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-200">{activeRuleCount} active rules</span>
        </div>

        {isConnected && address ? (
          <button
            onClick={() => disconnect()}
            className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-normal text-zinc-200 transition hover:border-white/30 hover:text-white tabular-nums"
          >
            {address.slice(0, 6)}…{address.slice(-4)}
          </button>
        ) : (
          <button
            onClick={() => connect({ connector: injected() })}
            className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black transition hover:bg-zinc-200"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
