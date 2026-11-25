import { pgTable, text, boolean, doublePrecision, timestamp, integer } from 'drizzle-orm/pg-core';

export const sniperRules = pgTable('sniper_rules', {
  id: text('id').primaryKey(),
  walletAddress: text('wallet_address').notNull(),
  name: text('name').notNull(),
  rawPrompt: text('raw_prompt').notNull(),
  pairAsset: text('pair_asset').notNull(),
  maxMcapUsd: doublePrecision('max_mcap_usd').notNull(),
  minLiquidityUsd: doublePrecision('min_liquidity_usd').notNull(),
  maxTop10HoldersPct: doublePrecision('max_top10_holders_pct').notNull(),
  buyAmountEth: doublePrecision('buy_amount_eth').notNull(),
  takeProfitMultiplier: doublePrecision('take_profit_multiplier').notNull(),
  stopLossPct: doublePrecision('stop_loss_pct').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const positions = pgTable('positions', {
  id: text('id').primaryKey(),
  walletAddress: text('wallet_address').notNull(),
  tokenAddress: text('token_address').notNull(),
  symbol: text('symbol').notNull(),
  quoteSymbol: text('quote_symbol').notNull(),
  entryEth: doublePrecision('entry_eth').notNull(),
  txHash: text('tx_hash'),
  status: text('status').notNull().default('open'), // 'open' | 'closed'
  pnlPct: doublePrecision('pnl_pct').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
