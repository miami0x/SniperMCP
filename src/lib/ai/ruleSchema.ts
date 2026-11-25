import { z } from 'zod';

export const ParsedRuleSchema = z.object({
  name: z.string().min(2).max(60),
  pairAsset: z.enum(['TTEQ', 'NVDA', 'META', 'AAPL', 'TSLA', 'WETH', 'ANY']).default('ANY'),
  maxMcapUsd: z.number().min(1000).max(500_000_000).default(150_000),
  minLiquidityUsd: z.number().min(0).max(50_000_000).default(10_000),
  maxTop10HoldersPct: z.number().min(1).max(100).default(20),
  buyAmountEth: z.number().min(0.001).max(50).default(0.05),
  takeProfitMultiplier: z.number().min(1.1).max(100).default(2.0),
  stopLossPct: z.number().min(5).max(95).default(35),
});

export type ParsedRuleInput = z.infer<typeof ParsedRuleSchema>;
