'use client';

import Link from 'next/link';
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
    <header className="flex items-center justify-between border-b border-white/10 bg-[#050505] px-6 py-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-baseline gap-3">
          <span
            className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-lg font-bold tracking-[-0.03em] text-transparent"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))' }}
          >
            SniperMCP
          </span>
          <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-light text-emerald-300 sm:inline">
            Chain 4663
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-xs font-light text-zinc-400 md:flex">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <Link href="/docs" className="transition hover:text-white">
            Docs
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-4 text-xs font-light text-zinc-400 lg:flex tabular-nums">
          <span className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                source === 'live'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-zinc-500'
              }`}
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
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-normal text-zinc-100 transition hover:border-white/30 tabular-nums"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
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
