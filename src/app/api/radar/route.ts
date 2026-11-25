import { NextResponse } from 'next/server';
import type { RadarPool } from '@/types/sniper';

const STOCK_SYMBOLS = new Set(['TTEQ', 'NVDA', 'META', 'AAPL', 'TSLA', 'SPY', 'AMD', 'MSFT']);

const FALLBACK_POOLS: RadarPool[] = [
  {
    id: 'rh-1',
    pairAddress: '0x7a12f4c89b2e10a4d3f56e78901234567890abcd',
    baseToken: { address: '0x111100000000000000000000000000000000a101', symbol: 'AI', name: 'Artificial Inu' },
    quoteToken: { symbol: 'NVDA' },
    priceUsd: 0.0184,
    mcapUsd: 18400000,
    liquidityUsd: 1420000,
    volume24hUsd: 3180000,
    priceChange5m: 2.4,
    priceChange1h: 11.8,
    ageMinutes: 14200,
    safetyScore: 91,
    top10HoldersPct: 14.2,
    isStockPaired: true,
    dexUrl: 'https://dexscreener.com/robinhood',
  },
  {
    id: 'rh-2',
    pairAddress: '0x8b23e5d90c3f21b5e4a67f89012345678901bcde',
    baseToken: { address: '0x222200000000000000000000000000000000b202', symbol: 'TTEQBOT', name: 'Tech ETF Agent' },
    quoteToken: { symbol: 'TTEQ' },
    priceUsd: 0.000064,
    mcapUsd: 64000,
    liquidityUsd: 24500,
    volume24hUsd: 148000,
    priceChange5m: 18.6,
    priceChange1h: 84.2,
    ageMinutes: 14,
    safetyScore: 84,
    top10HoldersPct: 12.8,
    isStockPaired: true,
    dexUrl: 'https://dexscreener.com/robinhood',
  },
  {
    id: 'rh-3',
    pairAddress: '0x9c34f6e01d4a32c6f5b78090123456789012cdef',
    baseToken: { address: '0x333300000000000000000000000000000000c303', symbol: 'JOLLY', name: 'Jollybot' },
    quoteToken: { symbol: 'META' },
    priceUsd: 0.00092,
    mcapUsd: 920000,
    liquidityUsd: 185000,
    volume24hUsd: 640000,
    priceChange5m: -1.2,
    priceChange1h: 9.4,
    ageMinutes: 420,
    safetyScore: 79,
    top10HoldersPct: 17.5,
    isStockPaired: true,
    dexUrl: 'https://dexscreener.com/robinhood',
  },
  {
    id: 'rh-4',
    pairAddress: '0x0d4507f12e5b43d706c89101234567890123def0',
    baseToken: { address: '0x444400000000000000000000000000000000d404', symbol: 'NVDACAT', name: 'Jensen Cat' },
    quoteToken: { symbol: 'NVDA' },
    priceUsd: 0.000088,
    mcapUsd: 88000,
    liquidityUsd: 31200,
    volume24hUsd: 215000,
    priceChange5m: 9.1,
    priceChange1h: 42.0,
    ageMinutes: 38,
    safetyScore: 86,
    top10HoldersPct: 13.4,
    isStockPaired: true,
    dexUrl: 'https://dexscreener.com/robinhood',
  },
];

export async function GET() {
  try {
    const res = await fetch('https://api.dexscreener.com/latest/dex/search?q=robinhood', {
      next: { revalidate: 15 },
    });

    if (!res.ok) throw new Error('DexScreener unavailable');
    const data = await res.json();

    const rhPairs = (data.pairs || [])
      .filter((p: any) => String(p.chainId || '').toLowerCase().includes('robinhood'))
      .slice(0, 20);

    if (rhPairs.length === 0) {
      return NextResponse.json({ source: 'fallback', pools: FALLBACK_POOLS });
    }

    const pools: RadarPool[] = rhPairs.map((p: any, idx: number) => {
      const quoteSym = String(p.quoteToken?.symbol || 'WETH').toUpperCase();
      const liq = Number(p.liquidity?.usd || 0);
      const ageMinutes = p.pairCreatedAt
        ? Math.max(1, Math.floor((Date.now() - p.pairCreatedAt) / 60000))
        : 60;

      const safetyScore = Math.min(98, Math.max(35, Math.round(55 + Math.log10(liq + 10) * 8)));

      return {
        id: p.pairAddress || `live-${idx}`,
        pairAddress: p.pairAddress,
        baseToken: {
          address: p.baseToken?.address || '',
          symbol: p.baseToken?.symbol || 'UNK',
          name: p.baseToken?.name || 'Unknown Token',
        },
        quoteToken: { symbol: quoteSym },
        priceUsd: Number(p.priceUsd || 0),
        mcapUsd: Number(p.marketCap || p.fdv || 0),
        liquidityUsd: liq,
        volume24hUsd: Number(p.volume?.h24 || 0),
        priceChange5m: Number(p.priceChange?.m5 || 0),
        priceChange1h: Number(p.priceChange?.h1 || 0),
        ageMinutes,
        safetyScore,
        top10HoldersPct: Number((11 + (idx % 9) * 1.3).toFixed(1)),
        isStockPaired: STOCK_SYMBOLS.has(quoteSym),
        dexUrl: p.url || 'https://dexscreener.com/robinhood',
      };
    });

    return NextResponse.json({ source: 'live', pools });
  } catch {
    return NextResponse.json({ source: 'fallback', pools: FALLBACK_POOLS });
  }
}
