'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import type { RadarPool, SimulationResult } from '@/types/sniper';

interface ExecutionPanelProps {
  selectedPool: RadarPool | null;
}

interface SavedPosition {
  id: string;
  tokenAddress: string;
  symbol: string;
  quoteSymbol: string;
  entryEth: number;
  pnlPct: number;
}

export function ExecutionPanel({ selectedPool }: ExecutionPanelProps) {
  const { address } = useAccount();
  const walletKey = (address || 'guest').toLowerCase();

  const [buyAmount, setBuyAmount] = useState('0.05');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [positions, setPositions] = useState<SavedPosition[]>([]);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch(`/api/positions?wallet=${encodeURIComponent(walletKey)}`);
      const data = await res.json();
      if (Array.isArray(data.positions)) {
        setPositions(data.positions);
      }
    } catch (err) {
      console.error('Failed to load positions:', err);
    }
  }, [walletKey]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

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

  async function handlePaperSnipe() {
    if (!selectedPool) return;
    const newPos: SavedPosition = {
      id: `pos-${Date.now()}`,
      tokenAddress: selectedPool.baseToken.address,
      symbol: selectedPool.baseToken.symbol,
      quoteSymbol: selectedPool.quoteToken.symbol,
      entryEth: parseFloat(buyAmount) || 0.05,
      pnlPct: Number((Math.random() * 24 - 4).toFixed(1)),
    };

    setPositions((prev) => [newPos, ...prev]);

    try {
      await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPos, walletAddress: walletKey }),
      });
    } catch (err) {
      console.error('Failed to save position:', err);
    }
  }

  async function handleClosePosition(id: string) {
    setPositions((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(
        `/api/positions?id=${encodeURIComponent(id)}&wallet=${encodeURIComponent(walletKey)}`,
        { method: 'DELETE' }
      );
    } catch (err) {
      console.error('Failed to close position:', err);
    }
  }

  async function handleCloseAll() {
    setPositions([]);
    try {
      await fetch(`/api/positions?all=true&wallet=${encodeURIComponent(walletKey)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to close all positions:', err);
    }
  }

  return (
    <section className="flex h-full flex-col">
      <div className="border-b border-white/[0.08] px-6 py-4">
        <h2 className="text-sm font-medium tracking-[-0.01em] text-white">Execution</h2>
        <p className="mt-0.5 text-xs font-light text-zinc-500">
          Pre-flight simulation &amp; active positions
        </p>
      </div>

      <div className="border-b border-white/[0.08] p-6">
        {selectedPool ? (
          <>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-normal tracking-[-0.02em] text-white">
                  {selectedPool.baseToken.symbol}
                </span>
                <span className="ml-1.5 text-sm font-light text-zinc-500">
                  /{selectedPool.quoteToken.symbol}
                </span>
              </div>
              <span className="font-mono text-xs text-zinc-500">
                {selectedPool.baseToken.address.slice(0, 6)}…
                {selectedPool.baseToken.address.slice(-4)}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3">
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
                className="rounded-full border border-emerald-400/35 bg-emerald-400/10 px-4 py-1.5 text-xs font-normal text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-40"
              >
                {simLoading ? 'Checking…' : 'Simulate'}
              </button>
            </div>

            {simResult && (
              <div className="mt-5 space-y-3 rounded-xl border border-white/[0.08] bg-black/30 p-4 text-xs font-light">
                <div className="flex items-center justify-between">
                  <span className={simResult.safe ? 'text-emerald-400' : 'text-amber-400'}>
                    Risk · {simResult.honeypotRisk}
                  </span>
                  <span className="text-zinc-400 tabular-nums">
                    {simResult.estimatedGasGwei} gwei
                  </span>
                </div>

                <ul className="space-y-1.5 text-zinc-300">
                  {simResult.notes.map((n, i) => (
                    <li key={i} className="leading-relaxed">
                      — {n}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handlePaperSnipe}
                  className="mt-2 w-full rounded-full bg-white py-2.5 text-xs font-medium text-black transition hover:bg-zinc-200"
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
          <span className="text-xs font-normal text-zinc-400">
            Positions ({positions.length})
          </span>
          {positions.length > 0 && (
            <button
              onClick={handleCloseAll}
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
              <div
                key={pos.id}
                className="flex items-center justify-between py-3 text-xs tabular-nums"
              >
                <div>
                  <span className="font-medium text-white">{pos.symbol}</span>
                  <span className="text-zinc-500">/{pos.quoteSymbol}</span>
                  <span className="block text-[11px] font-light text-zinc-500">
                    {pos.entryEth} ETH
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={pos.pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {pos.pnlPct >= 0 ? '+' : ''}
                    {pos.pnlPct}%
                  </span>
                  <button
                    onClick={() => handleClosePosition(pos.id)}
                    className="text-zinc-500 transition hover:text-rose-400"
                    title="Close position"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
