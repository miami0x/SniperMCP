'use client';

import { useEffect, useState, useCallback } from 'react';
import { TopBar } from '@/components/terminal/TopBar';
import { RadarPanel } from '@/components/terminal/RadarPanel';
import { RuleBuilderPanel } from '@/components/terminal/RuleBuilderPanel';
import { ExecutionPanel } from '@/components/terminal/ExecutionPanel';
import type { RadarPool, SniperRule } from '@/types/sniper';

export default function TerminalPage() {
  const [pools, setPools] = useState<RadarPool[]>([]);
  const [source, setSource] = useState<'live' | 'fallback'>('fallback');
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<RadarPool | null>(null);
  const [rules, setRules] = useState<SniperRule[]>([]);

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

  return (
    <div className="flex min-h-screen flex-col bg-[#030303]">
      <TopBar
        source={source}
        activeRuleCount={rules.filter((r) => r.active).length}
        poolCount={pools.length}
      />

      <main className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-12">
        <div className="lg:col-span-4 xl:col-span-3">
          <RadarPanel
            pools={pools}
            selectedPoolId={selectedPool?.id || null}
            onSelectPool={setSelectedPool}
            onRefresh={fetchRadar}
            loading={loading}
          />
        </div>

        <div className="lg:col-span-4 xl:col-span-5">
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

        <div className="lg:col-span-4 xl:col-span-4">
          <ExecutionPanel selectedPool={selectedPool} />
        </div>
      </main>
    </div>
  );
}
