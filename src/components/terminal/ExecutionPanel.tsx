'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import { parseEther, formatUnits } from 'viem';
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
  txHash?: string | null;
  pnlPct: number;
}

const FEE_ROUTER_ADDRESS = (process.env.NEXT_PUBLIC_FEE_ROUTER_ADDRESS || '') as `0x${string}`;
const DEX_ROUTER_ADDRESS = (process.env.NEXT_PUBLIC_DEX_ROUTER_ADDRESS || '') as `0x${string}`;

const FEE_ROUTER_ABI = [
  {
    name: 'snipeETHForTokens',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'dexRouter', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

export function ExecutionPanel({ selectedPool }: ExecutionPanelProps) {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { writeContractAsync, isPending: txPending } = useWriteContract();

  const walletKey = (address || 'guest').toLowerCase();
  const ethBalance = balanceData
    ? Number(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)
    : '0.0000';

  const [mode, setMode] = useState<'paper' | 'live'>('paper');
  const [buyAmount, setBuyAmount] = useState('0.05');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
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
    setTxError(null);
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

  async function savePosition(txHash: string | null) {
    if (!selectedPool) return;
    const newPos: SavedPosition = {
      id: `pos-${Date.now()}`,
      tokenAddress: selectedPool.baseToken.address,
      symbol: selectedPool.baseToken.symbol,
      quoteSymbol: selectedPool.quoteToken.symbol,
      entryEth: parseFloat(buyAmount) || 0.05,
      txHash,
      pnlPct: txHash ? 0 : Number((Math.random() * 24 - 4).toFixed(1)),
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

  async function handleExecute() {
    if (!selectedPool) return;
    setTxError(null);

    if (mode === 'paper') {
      await savePosition(null);
      return;
    }

    if (!isConnected) {
      setTxError('Connect your wallet first to execute live swaps.');
      return;
    }

    if (!FEE_ROUTER_ADDRESS || !DEX_ROUTER_ADDRESS) {
      setTxError('Set NEXT_PUBLIC_FEE_ROUTER_ADDRESS and NEXT_PUBLIC_DEX_ROUTER_ADDRESS to enable live swaps.');
      return;
    }

    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
      const hash = await writeContractAsync({
        address: FEE_ROUTER_ADDRESS,
        abi: FEE_ROUTER_ABI,
        functionName: 'snipeETHForTokens',
        args: [
          DEX_ROUTER_ADDRESS,
          selectedPool.baseToken.address as `0x${string}`,
          BigInt(0),
          deadline,
        ],
        value: parseEther(buyAmount || '0.05'),
      });
      await savePosition(hash);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction rejected';
      setTxError(msg.slice(0, 120));
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
      <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
        <div>
          <h2 className="text-sm font-medium tracking-[-0.01em] text-white">Execution</h2>
          <p className="mt-0.5 text-xs font-light text-zinc-500">
            {isConnected ? `Bal: ${ethBalance} ETH` : 'Pre-flight simulation & positions'}
          </p>
        </div>

        {/* Paper / Live Toggle */}
        <div className="flex rounded-full border border-white/10 bg-black/50 p-0.5 text-[11px]">
          <button
            onClick={() => setMode('paper')}
            className={`rounded-full px-3 py-1 transition ${
              mode === 'paper' ? 'bg-white text-black font-medium' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Paper
          </button>
          <button
            onClick={() => setMode('live')}
            className={`rounded-full px-3 py-1 transition ${
              mode === 'live'
                ? 'bg-emerald-400 text-black font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Live
          </button>
        </div>
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

            <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3">
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

            {/* Quick-fill ETH presets */}
            <div className="mt-2.5 flex items-center gap-2 text-[11px] font-light text-zinc-400">
              {['0.01', '0.05', '0.1', '0.25'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBuyAmount(amt)}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-0.5 transition hover:border-emerald-400/40 hover:text-white"
                >
                  {amt} ETH
                </button>
              ))}
            </div>

            {txError && (
              <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-300">
                {txError}
              </p>
            )}

            {simResult && (
              <div className="mt-4 space-y-3 rounded-xl border border-white/[0.08] bg-black/30 p-4 text-xs font-light">
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
                  onClick={handleExecute}
                  disabled={txPending}
                  className={`mt-2 w-full rounded-full py-2.5 text-xs font-medium transition disabled:opacity-50 ${
                    mode === 'live'
                      ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {txPending
                    ? 'Confirm in Wallet…'
                    : mode === 'live'
                      ? `Execute Live Snipe (${buyAmount} ETH · 0.5% fee)`
                      : `Execute Paper Snipe (${buyAmount} ETH)`}
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
                    {pos.txHash && (
                      <>
                        {' · '}
                        <a
                          href={`https://robinhoodchain.blockscout.com/tx/${pos.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline"
                        >
                          tx ↗
                        </a>
                      </>
                    )}
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
