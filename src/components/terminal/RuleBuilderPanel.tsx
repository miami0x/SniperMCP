'use client';

import { useState } from 'react';
import type { RadarPool, SniperRule } from '@/types/sniper';

interface RuleBuilderPanelProps {
  rules: SniperRule[];
  pools: RadarPool[];
  onAddRule: (rule: SniperRule) => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
}

const EXAMPLES = [
  'Snipe new $TTEQ pairs under $100K cap, top 10 holders <15%, buy 0.05 ETH, TP 2x',
  'Snipe $NVDA pairs under $200K mcap, top 10 <18%, buy 0.1 ETH, TP 3x',
  'Snipe $META pairs under $1M cap, top 10 <20%, buy 0.05 ETH, TP 2.5x',
];

function countMatches(rule: SniperRule, pools: RadarPool[]) {
  return pools.filter((p) => {
    const pairOk = rule.pairAsset === 'ANY' || p.quoteToken.symbol.toUpperCase() === rule.pairAsset;
    const mcapOk = p.mcapUsd <= rule.maxMcapUsd;
    const liqOk = p.liquidityUsd >= rule.minLiquidityUsd;
    const holdOk = p.top10HoldersPct <= rule.maxTop10HoldersPct;
    return pairOk && mcapOk && liqOk && holdOk;
  }).length;
}

export function RuleBuilderPanel({
  rules,
  pools,
  onAddRule,
  onToggleRule,
  onDeleteRule,
}: RuleBuilderPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCompile(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/parse-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.rule) {
        onAddRule({
          id: `rule-${Date.now()}`,
          rawPrompt: prompt,
          active: true,
          createdAt: new Date().toLocaleTimeString(),
          ...data.rule,
        });
        setPrompt('');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex h-full flex-col bg-[#050505]">
      <div className="border-b border-white/[0.08] px-6 py-4">
        <h2 className="text-sm font-medium tracking-[-0.01em] text-white">Strategy Compiler</h2>
        <p className="mt-0.5 text-xs font-light text-zinc-500">
          Describe entry, holder limits, and exit in plain language
        </p>
      </div>

      <form onSubmit={handleCompile} className="border-b border-white/[0.08] p-6">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Snipe new $TTEQ pairs under $100K cap, top 10 holders under 15%, buy 0.05 ETH, take profit at 2x"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-sm font-light leading-relaxed text-white placeholder-zinc-600 focus:border-emerald-400/40 focus:outline-none"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 text-xs font-light">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(ex)}
                className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-zinc-400 transition hover:border-white/25 hover:text-white"
              >
                Preset {i + 1}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="rounded-full bg-white px-5 py-1.5 text-xs font-medium text-black transition hover:bg-zinc-200 disabled:opacity-30"
          >
            {loading ? 'Compiling…' : 'Create Rule'}
          </button>
        </div>
      </form>

      <div className="flex-1 divide-y divide-white/[0.06] overflow-y-auto">
        {rules.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-extralight text-zinc-300">No active execution rules yet.</p>
            <p className="mt-1 text-xs font-light text-zinc-500">
              Select a preset above or write your own trigger to begin monitoring.
            </p>
          </div>
        ) : (
          rules.map((rule) => {
            const matches = countMatches(rule, pools);
            return (
              <div
                key={rule.id}
                className={`px-6 py-5 transition ${rule.active ? 'opacity-100' : 'opacity-45'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-medium text-white">{rule.name}</span>
                      <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300 tabular-nums">
                        {matches} {matches === 1 ? 'match' : 'matches'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-light text-zinc-400">{rule.rawPrompt}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-light">
                    <button
                      onClick={() => onToggleRule(rule.id)}
                      className={rule.active ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'}
                    >
                      {rule.active ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="text-zinc-500 transition hover:text-rose-400"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs tabular-nums">
                  <div>
                    <span className="block text-[10px] font-light text-zinc-500">Pair</span>
                    <span className="text-emerald-300">{rule.pairAsset}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-light text-zinc-500">Max Cap</span>
                    <span className="text-zinc-100">${Math.round(rule.maxMcapUsd / 1000)}K</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-light text-zinc-500">Size</span>
                    <span className="text-zinc-100">{rule.buyAmountEth} ETH</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-light text-zinc-500">Target / Stop</span>
                    <span className="text-emerald-400">
                      {rule.takeProfitMultiplier}x / −{rule.stopLossPct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
