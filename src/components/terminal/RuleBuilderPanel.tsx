'use client';

import { useState } from 'react';
import { Sparkles, Power, Trash2, Zap } from 'lucide-react';
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
  const [parserMode, setParserMode] = useState<string | null>(null);

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
        setParserMode(data.mode || 'local-parser');
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
    <section className="flex h-full flex-col rounded-xl border border-zinc-800/90 bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-zinc-200">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          AI RULE COMPILER
        </span>
        {parserMode && (
          <span className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
            ENGINE: {parserMode.toUpperCase()}
          </span>
        )}
      </div>

      <form onSubmit={handleCompile} className="border-b border-zinc-800/80 p-4">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Type a rule in plain English... e.g. "Snipe new $TTEQ pairs under $100K cap, top 10 holders <15%, buy 0.05 ETH, TP 2x"'
          className="w-full resize-none rounded-lg border border-zinc-800 bg-[#050505] p-3 font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:border-cyan-400/60 focus:outline-none"
        />

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(ex)}
                className="rounded border border-zinc-800 bg-zinc-900/70 px-2 py-1 font-mono text-[10px] text-zinc-400 transition hover:border-cyan-500/40 hover:text-cyan-300"
              >
                Preset {i + 1}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-400/15 px-4 py-2 font-mono text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/25 disabled:opacity-40"
          >
            <Zap className="h-3.5 w-3.5" />
            {loading ? 'COMPILING...' : 'COMPILE RULE'}
          </button>
        </div>
      </form>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {rules.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 text-center">
            <p className="font-mono text-xs text-zinc-500">No active sniper rules yet.</p>
            <p className="mt-1 text-[11px] text-zinc-600">Pick a preset above or type your own strategy.</p>
          </div>
        ) : (
          rules.map((rule) => {
            const matches = countMatches(rule, pools);
            return (
              <div
                key={rule.id}
                className={`rounded-lg border p-3.5 transition ${
                  rule.active
                    ? 'border-cyan-500/40 bg-[#060d10]'
                    : 'border-zinc-800/80 bg-[#060606] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-100">{rule.name}</span>
                      <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
                        {matches} MATCH{matches === 1 ? '' : 'ES'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">&ldquo;{rule.rawPrompt}&rdquo;</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleRule(rule.id)}
                      className={`rounded p-1.5 transition ${
                        rule.active
                          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Toggle rule"
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="rounded bg-zinc-900 p-1.5 text-zinc-500 transition hover:bg-rose-500/15 hover:text-rose-400"
                      title="Delete rule"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2 rounded bg-[#030303] p-2 font-mono text-[10px]">
                  <div>
                    <span className="block text-zinc-500">PAIR</span>
                    <span className="text-cyan-300">{rule.pairAsset}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">MAX MCAP</span>
                    <span className="text-zinc-200">${Math.round(rule.maxMcapUsd / 1000)}K</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">SIZE</span>
                    <span className="text-zinc-200">{rule.buyAmountEth} ETH</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">TP / SL</span>
                    <span className="text-emerald-400">
                      {rule.takeProfitMultiplier}x / -{rule.stopLossPct}%
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
