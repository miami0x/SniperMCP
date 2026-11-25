'use client';

import { useState } from 'react';
import type { RadarPool } from '@/types/sniper';

interface RadarPanelProps {
  pools: RadarPool[];
  selectedPoolId: string | null;
  onSelectPool: (pool: RadarPool) => void;
  onRefresh: () => void;
  loading: boolean;
}

const FILTERS = ['All', 'Stock', 'TTEQ', 'NVDA', 'META'] as const;

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
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const filtered = pools.filter((p) => {
    if (filter === 'All') return true;
    if (filter === 'Stock') return p.isStockPaired;
    return p.quoteToken.symbol.toUpperCase() === filter;
  });

  return (
    <section className="flex h-full flex-col bg-black">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
        <div>
          <h2 className="text-sm font-normal tracking-[-0.01em] text-zinc-100">Pool Radar</h2>
          <p className="mt-0.5 text-xs font-light text-zinc-500">
            Real-time liquidity and tokenized stock pairs
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs font-light text-zinc-500 transition hover:text-white disabled:opacity-40"
        >
          {loading ? 'Syncing…' : 'Refresh'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-white/[0.06] px-6 py-2.5 text-xs font-light">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`transition ${
              filter === f ? 'font-normal text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 divide-y divide-white/[0.06] overflow-y-auto">
        {filtered.map((pool) => {
          const isSelected = pool.id === selectedPoolId;
          return (
            <div
              key={pool.id}
              onClick={() => onSelectPool(pool)}
              className={`cursor-pointer px-6 py-4 transition ${
                isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-normal tracking-[-0.01em] text-white">
                    {pool.baseToken.symbol}
                  </span>
                  <span className="text-xs font-light text-zinc-500">/{pool.quoteToken.symbol}</span>
                </div>
                <span className="text-xs font-light text-zinc-400 tabular-nums">
                  Score {pool.safetyScore}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs tabular-nums">
                <div>
                  <span className="block text-[11px] font-light text-zinc-600">Market Cap</span>
                  <span className="font-light text-zinc-200">{fmtUsd(pool.mcapUsd)}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-light text-zinc-600">Liquidity</span>
                  <span className="font-light text-zinc-200">{fmtUsd(pool.liquidityUsd)}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] font-light text-zinc-600">1h Change</span>
                  <span
                    className={`font-light ${
                      pool.priceChange1h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {pool.priceChange1h >= 0 ? '+' : ''}
                    {pool.priceChange1h.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-light text-zinc-600">
                <span>Top 10 holders · {pool.top10HoldersPct}%</span>
                <a
                  href={pool.dexUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-zinc-500 transition hover:text-white"
                >
                  Chart ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
