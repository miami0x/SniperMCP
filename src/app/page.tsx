'use client';

import { useEffect, useState, useCallback } from 'react';
import { TopBar } from '@/components/terminal/TopBar';
import { RadarPanel } from '@/components/terminal/RadarPanel';
import { RuleBuilderPanel } from '@/components/terminal/RuleBuilderPanel';
import { ExecutionPanel } from '@/components/terminal/ExecutionPanel';
import type { RadarPool, SniperRule } from '@/types/sniper';

type MobileTab = 'radar' | 'rules' | 'exec';

export default function TerminalPage() {
  const [pools, setPools] = useState<RadarPool[]>([]);
  const [source, setSource] = useState<'live' | 'fallback'>('fallback');
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<RadarPool | null>(null);
  const [rules, setRules] = useState<SniperRule[]>([]);
  const [mobileTab, setMobileTab] = useState<MobileTab>('radar');

  const fetchRadar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/radar');
      const data = await res.json();
      setPools(data.pools || []);
      setSource(data.source === 'live' ? 'live' : 'fallback');
      if (!selectedPool && data.pools?.length > 0) {
        setSelectedPool(data.pools[0]);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPool]);

  useEffect(() => {
    fetchRadar();
    const timer = setInterval(fetchRadar, 20000);
    return () => clearInterval(timer);
  }, [fetchRadar]);

  const activeRuleCount = rules.filter((r) => r.active).length;

  return (
    <div className="flex min-h-screen flex-col bg-[#030303]">
      <TopBar source={source} activeRuleCount={activeRuleCount} poolCount={pools.length} />

      {/* Mobile Tab Bar */}
      <div className="grid grid-cols-3 border-b border-zinc-800/80 bg-[#070707] p-1.5 font-mono text-[11px] lg:hidden">
        <button
          onClick={() => setMobileTab('radar')}
          className={`rounded py-2 font-semibold transition ${
            mobileTab === 'radar'
              ? 'bg-cyan-400/15 text-cyan-300'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          RADAR ({pools.length})
        </button>
        <button
          onClick={() => setMobileTab('rules')}
          className={`rounded py-2 font-semibold transition ${
            mobileTab === 'rules'
              ? 'bg-cyan-400/15 text-cyan-300'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          AI RULES ({activeRuleCount})
        </button>
        <button
          onClick={() => setMobileTab('exec')}
          className={`rounded py-2 font-semibold transition ${
            mobileTab === 'exec'
              ? 'bg-cyan-400/15 text-cyan-300'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          EXEC {selectedPool ? `· ${selectedPool.baseToken.symbol}` : ''}
        </button>
      </div>

      <main className="grid flex-1 grid-cols-1 gap-4 p-3 sm:p-4 lg:grid-cols-12">
        <div className={`${mobileTab === 'radar' ? 'block' : 'hidden'} lg:col-span-4 lg:block xl:col-span-3`}>
          <RadarPanel
            pools={pools}
            selectedPoolId={selectedPool?.id || null}
            onSelectPool={(pool) => {
              setSelectedPool(pool);
              setMobileTab('exec');
            }}
            onRefresh={fetchRadar}
            loading={loading}
          />
        </div>

        <div className={`${mobileTab === 'rules' ? 'block' : 'hidden'} lg:col-span-4 lg:block xl:col-span-5`}>
          <RuleBuilderPanel
            rules={rules}
            pools={pools}
            onAddRule={(rule) => setRules((prev) => [rule, ...prev])}
            onToggleRule={(id) =>
              setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)))
            }
            onDeleteRule={(id) => setRules((prev) => prev.filter((r) => r.id !== id))}
          />
        </div>

        <div className={`${mobileTab === 'exec' ? 'block' : 'hidden'} lg:col-span-4 lg:block xl:col-span-4`}>
          <ExecutionPanel selectedPool={selectedPool} />
        </div>
      </main>
    </div>
  );
}
