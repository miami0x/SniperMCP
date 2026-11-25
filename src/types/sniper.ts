export type PairAsset = 'TTEQ' | 'NVDA' | 'META' | 'AAPL' | 'TSLA' | 'WETH' | 'ANY';

export interface RadarPool {
  id: string;
  pairAddress: string;
  baseToken: {
    address: string;
    symbol: string;
    name: string;
  };
  quoteToken: {
    symbol: string;
  };
  priceUsd: number;
  mcapUsd: number;
  liquidityUsd: number;
  volume24hUsd: number;
  priceChange5m: number;
  priceChange1h: number;
  ageMinutes: number;
  safetyScore: number; // 0 - 100
  top10HoldersPct: number;
  isStockPaired: boolean;
  dexUrl: string;
}

export interface SniperRule {
  id: string;
  name: string;
  rawPrompt: string;
  active: boolean;
  pairAsset: PairAsset;
  maxMcapUsd: number;
  minLiquidityUsd: number;
  maxTop10HoldersPct: number;
  buyAmountEth: number;
  takeProfitMultiplier: number;
  stopLossPct: number;
  createdAt: string;
}

export interface SimulationResult {
  safe: boolean;
  isContract: boolean;
  estimatedGasGwei: string;
  honeypotRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  taxEstimatePct: number;
  notes: string[];
}
