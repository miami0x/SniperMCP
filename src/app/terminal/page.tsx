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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#020305]">
      {/* Ambient refraction orbs for glassmorphism */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.11] blur-[120px]" />
        <div className="absolute right-[-120px] top-1/3 h-[380px] w-[380px] rounded-full bg-emerald-500/[0.08] blur-[120px]" />
        <div className="absolute bottom-[-140px] left-1/3 h-[360px] w-[360px] rounded-full bg-indigo-500/[0.09] blur-[120px]" />
      </div>

      <TopBar source={source} activeRuleCount={activeRuleCount} poolCount={pools.length} />

      {/* Mobile Tab Bar */}
      <div className="relative z-10 grid grid-cols-3 border-b border-white/[0.08] bg-black/50 text-xs font-light backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileTab('radar')}
          className={`py-3 transition ${
            mobileTab === 'radar' ? 'border-b border-emerald-400 text-white' : 'text-zinc-500'
          }`}
        >
          Radar ({pools.length})
        </button>
        <button
          onClick={() => setMobileTab('rules')}
          className={`py-3 transition ${
            mobileTab === 'rules' ? 'border-b border-emerald-400 text-white' : 'text-zinc-500'
          }`}
        >
          Rules ({activeRuleCount})
        </button>
        <button
          onClick={() => setMobileTab('exec')}
          className={`py-3 transition ${
            mobileTab === 'exec' ? 'border-b border-emerald-400 text-white' : 'text-zinc-500'
          }`}
        >
          Execute
        </button>
      </div>

      <main className="relative z-10 grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-12">
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
