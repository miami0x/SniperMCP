'use client';

import { useState } from 'react';
import { ShieldCheck } from '@phosphor-icons/react';
import type { RadarPool, SimulationResult } from '@/types/sniper';

interface ExecutionPanelProps {
  selectedPool: RadarPool | null;
}

interface SimPosition {
  id: string;
  symbol: string;
  quote: string;
  entryEth: number;
  pnlPct: number;
}

export function ExecutionPanel({ selectedPool }: ExecutionPanelProps) {
  const [buyAmount, setBuyAmount] = useState('0.05');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [positions, setPositions] = useState<SimPosition[]>([]);

  async function handleSimulate() {
    if (!selectedPool || simLoading) return;
    setSimLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAddress: selectedPool.baseToken.address,
          buyAmountEth: parseFloat(buyAmount) || 0.05,
        }),
      });
      const data = await res.json();
      setSimResult(data);
    } finally {
      setSimLoading(false);
    }
  }

  function handlePaperSnipe() {
    if (!selectedPool) return;
    setPositions((prev) => [
      {
        id: `pos-${Date.now()}`,
        symbol: selectedPool.baseToken.symbol,
        quote: selectedPool.quoteToken.symbol,
        entryEth: parseFloat(buyAmount) || 0.05,
        pnlPct: Number((Math.random() * 24 - 4).toFixed(1)),
      },
      ...prev,
    ]);
  }

  return (
    <section className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
        <div>
          <h2 className="text-sm font-normal tracking-[-0.01em] text-white">Execution</h2>
          <p className="mt-0.5 text-xs font-light text-zinc-400">
            Pre-flight simulation &amp; positions
          </p>
        </div>
        <ShieldCheck weight="thin" className="h-4 w-4 text-emerald-400/80" />
      </div>

      <div className="border-b border-white/[0.08] p-6">
        {selectedPool ? (
          <>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-xl font-extralight tracking-[-0.03em] text-transparent">
                  {selectedPool.baseToken.symbol}
                </span>
                <span className="ml-1.5 text-sm font-light text-zinc-500">
                  /{selectedPool.quoteToken.symbol}
                </span>
              </div>
              <span className="text-xs font-light text-zinc-500 tabular-nums">
                {selectedPool.baseToken.address.slice(0, 6)}…{selectedPool.baseToken.address.slice(-4)}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3">
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="w-24 bg-transparent text-2xl font-extralight tracking-[-0.02em] text-white focus:outline-none tabular-nums"
                />
                <span className="text-xs font-light text-zinc-500">ETH</span>
              </div>

              <button
                onClick={handleSimulate}
                disabled={simLoading}
                className="rounded-full border border-emerald-400/35 bg-emerald-400/10 px-4 py-1.5 text-xs font-normal text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-40"
              >
                {simLoading ? 'Checking…' : 'Simulate'}
              </button>
            </div>

            {simResult && (
              <div className="mt-5 space-y-3 rounded-xl border border-white/[0.06] bg-black/30 p-4 text-xs font-light">
                <div className="flex items-center justify-between">
                  <span className={simResult.safe ? 'text-emerald-400' : 'text-amber-400'}>
                    Risk · {simResult.honeypotRisk}
                  </span>
                  <span className="text-zinc-400 tabular-nums">{simResult.estimatedGasGwei} gwei</span>
                </div>

                <ul className="space-y-1.5 text-zinc-400">
                  {simResult.notes.map((n, i) => (
                    <li key={i} className="leading-relaxed">
                      — {n}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handlePaperSnipe}
                  className="liquid-btn mt-2 w-full rounded-full py-2.5 text-xs font-medium transition"
                >
                  Execute Paper Snipe ({buyAmount} ETH)
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="py-8 text-center text-xs font-light text-zinc-500">
            Select a pool from the radar to inspect and simulate.
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-normal text-zinc-400">Positions ({positions.length})</span>
          {positions.length > 0 && (
            <button
              onClick={() => setPositions([])}
              className="text-xs font-light text-rose-400 transition hover:text-rose-300"
            >
              Close All
            </button>
          )}
        </div>

        <div className="flex-1 divide-y divide-white/[0.06] overflow-y-auto">
          {positions.length === 0 ? (
            <p className="py-10 text-center text-xs font-light text-zinc-500">
              No open positions.
            </p>
          ) : (
            positions.map((pos) => (
              <div key={pos.id} className="flex items-center justify-between py-3 text-xs tabular-nums">
                <div>
                  <span className="font-normal text-white">{pos.symbol}</span>
                  <span className="text-zinc-500">/{pos.quote}</span>
                  <span className="block text-[11px] font-light text-zinc-500">{pos.entryEth} ETH</span>
                </div>
                <span className={pos.pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {pos.pnlPct >= 0 ? '+' : ''}
                  {pos.pnlPct}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
