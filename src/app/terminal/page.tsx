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
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <TopBar source={source} activeRuleCount={activeRuleCount} poolCount={pools.length} />

      {/* Mobile Tab Bar */}
      <div className="grid grid-cols-3 border-b border-white/10 bg-[#050505] text-xs font-light lg:hidden">
        <button
          onClick={() => setMobileTab('radar')}
          className={`py-3 transition ${
            mobileTab === 'radar' ? 'border-b-2 border-emerald-400 text-white' : 'text-zinc-500'
          }`}
        >
          Radar ({pools.length})
        </button>
        <button
          onClick={() => setMobileTab('rules')}
          className={`py-3 transition ${
            mobileTab === 'rules' ? 'border-b-2 border-emerald-400 text-white' : 'text-zinc-500'
          }`}
        >
          Rules ({activeRuleCount})
        </button>
        <button
          onClick={() => setMobileTab('exec')}
          className={`py-3 transition ${
            mobileTab === 'exec' ? 'border-b-2 border-emerald-400 text-white' : 'text-zinc-500'
          }`}
        >
          Execute
        </button>
      </div>

      <main className="grid flex-1 grid-cols-1 divide-y divide-white/[0.08] lg:grid-cols-12 lg:divide-x lg:divide-y-0">
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
