'use client';

import { useState } from 'react';
import { ShieldAlert, Play, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
    <section className="flex h-full flex-col rounded-xl border border-zinc-800/90 bg-[#0a0a0a]">
      <div className="border-b border-zinc-800/80 px-3.5 py-2.5 font-mono text-xs font-semibold tracking-wider text-zinc-200">
        EXECUTION &amp; GUARDRAILS
      </div>

      <div className="border-b border-zinc-800/80 p-3.5">
        {selectedPool ? (
          <>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-cyan-300">
                {selectedPool.baseToken.symbol}/{selectedPool.quoteToken.symbol}
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                {selectedPool.baseToken.address.slice(0, 6)}...{selectedPool.baseToken.address.slice(-4)}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-24 rounded-lg border border-zinc-800 bg-[#050505] px-2.5 py-2 font-mono text-xs text-zinc-100 focus:border-cyan-400/60 focus:outline-none"
              />
              <span className="font-mono text-xs text-zinc-500">ETH</span>
              <button
                onClick={handleSimulate}
                disabled={simLoading}
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-400/15 px-3 py-2 font-mono text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/25"
              >
                <Play className="h-3 w-3" />
                {simLoading ? 'CHECKING...' : 'SIMULATE'}
              </button>
            </div>

            {simResult && (
              <div className="mt-3 rounded-lg border border-zinc-800 bg-[#050505] p-3 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {simResult.safe ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    <span className={simResult.safe ? 'text-emerald-400' : 'text-amber-400'}>
                      RISK: {simResult.honeypotRisk}
                    </span>
                  </span>
                  <span className="text-zinc-500">{simResult.estimatedGasGwei} gwei</span>
                </div>
                <ul className="mt-2 space-y-1 text-[10px] text-zinc-400">
                  {simResult.notes.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
                <button
                  onClick={handlePaperSnipe}
                  className="mt-3 w-full rounded-lg border border-emerald-500/40 bg-emerald-500/15 py-2 font-mono text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
                >
                  EXECUTE PAPER SNIPE ({buyAmount} ETH)
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="py-6 text-center font-mono text-xs text-zinc-500">
            Select a pool from the Radar to simulate &amp; snipe.
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold text-zinc-400">
            ACTIVE POSITIONS ({positions.length})
          </span>
          {positions.length > 0 && (
            <button
              onClick={() => setPositions([])}
              className="flex items-center gap-1 rounded border border-rose-500/40 bg-rose-500/15 px-2 py-1 font-mono text-[10px] font-bold text-rose-300 hover:bg-rose-500/25"
            >
              <ShieldAlert className="h-3 w-3" />
              PANIC SELL ALL
            </button>
          )}
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {positions.length === 0 ? (
            <p className="py-8 text-center font-mono text-[11px] text-zinc-600">
              No open positions.
            </p>
          ) : (
            positions.map((pos) => (
              <div
                key={pos.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#050505] px-3 py-2 font-mono text-xs"
              >
                <div>
                  <span className="font-bold text-zinc-100">{pos.symbol}</span>
                  <span className="text-zinc-500">/{pos.quote}</span>
                  <span className="block text-[10px] text-zinc-500">{pos.entryEth} ETH</span>
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
