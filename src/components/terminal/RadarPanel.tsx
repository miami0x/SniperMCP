'use client';

import { useState } from 'react';
import { RefreshCw, ShieldCheck, ExternalLink } from 'lucide-react';
import type { RadarPool } from '@/types/sniper';

interface RadarPanelProps {
  pools: RadarPool[];
  selectedPoolId: string | null;
  onSelectPool: (pool: RadarPool) => void;
  onRefresh: () => void;
  loading: boolean;
}

const FILTERS = ['ALL', 'STOCK', 'TTEQ', 'NVDA', 'META'] as const;

function fmtUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function RadarPanel({
  pools,
  selectedPoolId,
  onSelectPool,
  onRefresh,
  loading,
}: RadarPanelProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');

  const filtered = pools.filter((p) => {
    if (filter === 'ALL') return true;
    if (filter === 'STOCK') return p.isStockPaired;
    return p.quoteToken.symbol.toUpperCase() === filter;
  });

  return (
    <section className="flex h-full flex-col rounded-xl border border-zinc-800/90 bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-3.5 py-2.5">
        <span className="font-mono text-xs font-semibold tracking-wider text-zinc-200">
          LIVE POOL RADAR
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-cyan-300"
          title="Refresh pools"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b border-zinc-800/60 px-3 py-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded px-2 py-1 font-mono text-[10px] font-semibold transition ${
              filter === f
                ? 'border border-cyan-400/50 bg-cyan-400/15 text-cyan-300'
                : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {f === 'STOCK' ? 'STOCK-PAIRED' : f}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {filtered.map((pool) => {
          const isSelected = pool.id === selectedPoolId;
          return (
            <div
              key={pool.id}
              onClick={() => onSelectPool(pool)}
              className={`cursor-pointer rounded-lg border p-3 transition ${
                isSelected
                  ? 'border-cyan-400/60 bg-cyan-950/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                  : 'border-zinc-800/80 bg-[#060606] hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-zinc-100">
                      {pool.baseToken.symbol}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">/{pool.quoteToken.symbol}</span>
                    {pool.isStockPaired && (
                      <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-cyan-300">
                        STOCK
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500">{pool.baseToken.name}</p>
                </div>

                <div className="flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  {pool.safetyScore}
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div>
                  <span className="block text-[9px] text-zinc-500">MCAP</span>
                  <span className="text-zinc-200">{fmtUsd(pool.mcapUsd)}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-zinc-500">LIQ</span>
                  <span className="text-zinc-200">{fmtUsd(pool.liquidityUsd)}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] text-zinc-500">1H</span>
                  <span className={pool.priceChange1h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {pool.priceChange1h >= 0 ? '+' : ''}
                    {pool.priceChange1h.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-zinc-800/60 pt-2 font-mono text-[10px] text-zinc-500">
                <span>Top10: {pool.top10HoldersPct}%</span>
                <a
                  href={pool.dexUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-zinc-400 hover:text-cyan-300"
                >
                  DEX <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
