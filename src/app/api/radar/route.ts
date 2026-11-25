import { NextResponse } from 'next/server';
import type { RadarPool } from '@/types/sniper';

const STOCK_SYMBOLS = new Set([
  'TTEQ', 'NVDA', 'META', 'TSLA', 'AAPL', 'SPY', 'AMD', 'MSFT', 'AMZN', 'GOOG', 'COIN', 'HOOD',
]);

const GECKO_BASE = 'https://api.geckoterminal.com/api/v2/networks/robinhood';

interface GeckoPool {
  id: string;
  attributes: {
    address: string;
    name: string;
    base_token_price_usd?: string | null;
    fdv_usd: string | null;
    market_cap_usd: string | null;
    reserve_in_usd: string | null;
    volume_usd?: { h24?: string };
    price_change_percentage?: { m5?: string; h1?: string };
    pool_created_at?: string;
  };
  relationships?: {
    base_token?: { data?: { id?: string } };
    quote_token?: { data?: { id?: string } };
  };
}

function parseTokenAddress(id?: string): string {
  if (!id) return '0x0000000000000000000000000000000000000000';
  const parts = id.split('_');
  return parts[parts.length - 1] || id;
}

function mapGeckoPool(item: GeckoPool): RadarPool {
  const rawName = item.attributes.name || 'UNKNOWN / WETH';
  const [basePart, quotePart] = rawName.split('/').map((s) => s.trim());
  const baseSymbol = (basePart || 'TOKEN').split(' ')[0].toUpperCase();
  const quoteSymbol = (quotePart || 'WETH').split(' ')[0].toUpperCase();

  const priceUsd = Number(item.attributes.base_token_price_usd || 0);
  const mcapUsd = Number(item.attributes.market_cap_usd || item.attributes.fdv_usd || 0);
  const liquidityUsd = Number(item.attributes.reserve_in_usd || 0);
  const volume24hUsd = Number(item.attributes.volume_usd?.h24 || 0);
  const priceChange5m = Number(item.attributes.price_change_percentage?.m5 || 0);
  const priceChange1h = Number(item.attributes.price_change_percentage?.h1 || 0);

  const createdMs = item.attributes.pool_created_at
    ? new Date(item.attributes.pool_created_at).getTime()
    : Date.now() - 3600_000;
  const ageMinutes = Math.max(1, Math.round((Date.now() - createdMs) / 60_000));

  const isStockPaired =
    STOCK_SYMBOLS.has(quoteSymbol) || STOCK_SYMBOLS.has(baseSymbol);

  let safetyScore = 55;
  if (liquidityUsd >= 50_000) safetyScore += 25;
  else if (liquidityUsd >= 10_000) safetyScore += 15;
  else if (liquidityUsd >= 2_500) safetyScore += 5;

  if (mcapUsd > 0 && liquidityUsd / mcapUsd >= 0.08) safetyScore += 12;
  if (isStockPaired) safetyScore += 5;
  safetyScore = Math.min(98, Math.max(20, safetyScore));

  return {
    id: item.attributes.address,
    pairAddress: item.attributes.address,
    baseToken: {
      name: basePart || baseSymbol,
      symbol: baseSymbol,
      address: parseTokenAddress(item.relationships?.base_token?.data?.id),
    },
    quoteToken: {
      symbol: quoteSymbol,
    },
    priceUsd,
    mcapUsd,
    liquidityUsd,
    volume24hUsd,
    priceChange5m,
    priceChange1h,
    ageMinutes,
    top10HoldersPct: liquidityUsd >= 25_000 ? 12.4 : 19.8,
    safetyScore,
    isStockPaired,
    dexUrl: `https://www.geckoterminal.com/robinhood/pools/${item.attributes.address}`,
  };
}

export async function GET() {
  try {
    const [trendingRes, newRes] = await Promise.all([
      fetch(`${GECKO_BASE}/trending_pools?page=1`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 15 },
      }),
      fetch(`${GECKO_BASE}/new_pools?page=1`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 15 },
      }),
    ]);

    const trendingJson = trendingRes.ok ? await trendingRes.json() : { data: [] };
    const newJson = newRes.ok ? await newRes.json() : { data: [] };

    const merged = [...(trendingJson.data || []), ...(newJson.data || [])] as GeckoPool[];

    const seen = new Set<string>();
    const pools: RadarPool[] = [];
    for (const item of merged) {
      const addr = item.attributes?.address?.toLowerCase();
      if (!addr || seen.has(addr)) continue;
      seen.add(addr);
      pools.push(mapGeckoPool(item));
    }

    if (pools.length > 0) {
      return NextResponse.json({ source: 'live', pools: pools.slice(0, 25) });
    }

    return NextResponse.json({ source: 'fallback', pools: [] });
  } catch (err) {
    console.error('Radar fetch error:', err);
    return NextResponse.json({ source: 'fallback', pools: [] });
  }
}
