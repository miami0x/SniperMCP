'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { TopBar } from '@/components/terminal/TopBar';
import { RadarPanel } from '@/components/terminal/RadarPanel';
import { RuleBuilderPanel } from '@/components/terminal/RuleBuilderPanel';
import { ExecutionPanel } from '@/components/terminal/ExecutionPanel';
import type { RadarPool, SniperRule } from '@/types/sniper';

type MobileTab = 'radar' | 'rules' | 'exec';

export default function TerminalPage() {
  const { address } = useAccount();
  const walletKey = (address || 'guest').toLowerCase();

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

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch(`/api/rules?wallet=${encodeURIComponent(walletKey)}`);
      const data = await res.json();
      if (Array.isArray(data.rules)) {
        setRules(data.rules);
      }
    } catch (err) {
      console.error('Failed to load rules:', err);
    }
  }, [walletKey]);

  useEffect(() => {
    fetchRadar();
    const timer = setInterval(fetchRadar, 20000);
    return () => clearInterval(timer);
  }, [fetchRadar]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  async function handleAddRule(rule: SniperRule) {
    setRules((prev) => [rule, ...prev]);
    try {
      await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rule, walletAddress: walletKey }),
      });
    } catch (err) {
      console.error('Failed to save rule:', err);
    }
  }

  async function handleToggleRule(id: string) {
    const target = rules.find((r) => r.id === id);
    if (!target) return;
    const nextActive = !target.active;

    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: nextActive } : r)));
    try {
      await fetch('/api/rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: nextActive, walletAddress: walletKey }),
      });
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  }

  async function handleDeleteRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/rules?id=${encodeURIComponent(id)}&wallet=${encodeURIComponent(walletKey)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  }

  const activeRuleCount = rules.filter((r) => r.active).length;

  return (
    <div className="flex min-h-screen flex-col bg-[#030504] text-zinc-100">
      <TopBar source={source} activeRuleCount={activeRuleCount} poolCount={pools.length} />

      {/* Mobile Tab Bar */}
      <div className="grid grid-cols-3 border-b border-white/10 bg-black/60 text-xs font-light backdrop-blur-xl lg:hidden">
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

      <main className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-12">
        <div
          className={`${
            mobileTab === 'radar' ? 'block' : 'hidden'
          } overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl lg:col-span-4 lg:block xl:col-span-3`}
        >
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

        <div
          className={`${
            mobileTab === 'rules' ? 'block' : 'hidden'
          } overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl lg:col-span-4 lg:block xl:col-span-5`}
        >
          <RuleBuilderPanel
            rules={rules}
            pools={pools}
            onAddRule={handleAddRule}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
          />
        </div>

        <div
          className={`${
            mobileTab === 'exec' ? 'block' : 'hidden'
          } overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl lg:col-span-4 lg:block xl:col-span-4`}
        >
          <ExecutionPanel selectedPool={selectedPool} />
        </div>
      </main>
    </div>
  );
}
