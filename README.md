# SniperMCP

![SniperMCP Hero](./public/hero-docs.jpg)

**Zero-Setup AI Trench Terminal & Stock-Pair Execution Engine for Robinhood Chain (L2).**

![Network](https://img.shields.io/badge/Network-Robinhood%20Chain%20(4663)-10b981?style=flat-square&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square)
![Database](https://img.shields.io/badge/Neon-Drizzle%20ORM-34d399?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)

SniperMCP replaces complex local CLI/MCP agent setups with a real-time, non-custodial web terminal purpose-built for Robinhood Chain's stock-paired memecoin ecosystem (`$TTEQ`, `$NVDA`, `$META`, `$AAPL`, `$TSLA`, `$SPY`).

---

## System Architecture

```text
+-----------------------+       +-------------------------+       +-------------------------+
|  Robinhood Chain RPC  |       |    AI Rule Compiler     |       |  Pre-Flight Simulator   |
|  & GeckoTerminal Feed | ----> |  (Natural Language ->   | ----> |  (Bytecode, Gas &       |
|  ($TTEQ/$NVDA/$META)  |       |   Validated JSON Rules) |       |   Honeypot Guardrails)  |
+-----------------------+       +-------------------------+       +-------------------------+
            |                                 |                                 |
            v                                 v                                 v
      [ Live Radar ]                  [ Strategy Cards ]               [ Execution & PnL ]
                                              \                               /
                                               v                             v
                                       +-------------------------------------+
                                       |  Neon Serverless Postgres (Drizzle) |
                                       |   Wallet-Scoped Rules & Positions   |
                                       +-------------------------------------+
Core CapabilitiesStock-Paired Pool Radar — Real-time trending and new-pool monitoring on Robinhood Chain (4663) via GeckoTerminal, with instant filtering for tokenized-equity pairs ($TTEQ, $NVDA, $META, $TSLA), liquidity depth, and safety scoring.Natural-Language Rule Compiler — Write execution rules in plain English (e.g. "Snipe new $TTEQ pairs under $100K cap, top 10 holders <15%, buy 0.05 ETH, TP 2x") and compile them into structured, toggleable strategy cards.Pre-Flight Swap Simulation — On-chain bytecode verification, live L2 gas estimation, and risk checks before any trade is signed.Neon Postgres Persistence — Wallet-scoped sniper rules and open/closed positions persisted via Drizzle ORM.Responsive Terminal UX — 3-column desktop command center that collapses into a dedicated tabbed terminal on mobile.Network ConfigurationParameterMainnetTestnetChain ID4663 (0x1237)46630 (0xb626)Native Gas TokenETHETHBlock Explorerrobinhoodchain.blockscout.comexplorer.testnet.chain.robinhood.comLocal DevelopmentBashgit clone [https://github.com/omni-deployer/SniperMCP.git](https://github.com/omni-deployer/SniperMCP.git)
cd SniperMCP
npm install
cp .env.example .env.local
# Add your Neon DATABASE_URL to .env.local
npx drizzle-kit push
npm run dev
Environment VariablesVariableRequiredDescriptionDATABASE_URLRequiredNeon Serverless Postgres connection stringNEXT_PUBLIC_CHAIN_ENVOptionalmainnet (default) or testnetNEXT_PUBLIC_ROBINHOOD_MAINNET_RPCOptionalCustom Robinhood Chain RPC endpointLLM_API_KEYOptionalOpenAI-compatible API key for LLM rule compilation (falls back to local parser if omitted)LLM_MODELOptionalModel identifier (default: gpt-4o-mini)Roadmap[x] V1: Live Robinhood Chain pool radar, AI rule compiler, pre-flight bytecode simulator, Neon Postgres persistence (rules & positions), responsive mobile terminal[ ] V2: Live wallet ETH/token balances, direct on-chain swap execution via SniperFeeRouter (0.5% fee), Telegram bot alerts on rule triggers[ ] V3: Background auto-sniping worker, whale leaderboards, copy-tradingBuilt for high-velocity on-chain research and execution. 100% non-custodial — always verify contracts before signing transactions.
