# SniperMCP

**Zero-Setup AI Trench Terminal & Stock-Pair Execution Engine for Robinhood Chain (L2).**

![Network](https://img.shields.io/badge/Network-Robinhood%20Chain%20(4663)-22d3ee?style=flat-square&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)

SniperMCP replaces complex local CLI/MCP agent setups with a real-time web terminal purpose-built for Robinhood Chain's stock-paired memecoin ecosystem (`$TTEQ`, `$NVDA`, `$META`, `$AAPL`, `$TSLA`).

---

## System Architecture

```text
+-----------------------+       +-------------------------+       +-------------------------+
|  Robinhood Chain RPC  |       |   AI Rule Compiler      |       |  Pre-Flight Simulator   |
|  & Live Pool Feeds    | ----> |  (Natural Language ->   | ----> |  (Bytecode, Gas &       |
|  ($TTEQ/$NVDA/$META)  |       |   Validated JSON Rules) |       |   Honeypot Guardrails)  |
+-----------------------+       +-------------------------+       +-------------------------+
            |                                 |                                 |
            v                                 v                                 v
      [ Live Radar ]                  [ Strategy Cards ]               [ Execution & PnL ]
Core CapabilitiesStock-Paired Pool Radar — Real-time pool monitoring with instant filtering for tokenized-equity pairs ($TTEQ, $NVDA, $META), liquidity depth, holder concentration, and safety scoring.Natural-Language Rule Compiler — Write execution rules in plain English (e.g. "Snipe new $TTEQ pairs under $100K cap, top 10 holders <15%, buy 0.05 ETH, TP 2x") and compile them into structured, toggleable strategy cards with live match tracking.Pre-Flight Swap Simulation — On-chain bytecode verification, live gas estimation, and risk checks before any trade is signed.Responsive Terminal UX — 3-column desktop command center that collapses into a dedicated tabbed terminal on mobile.Network ConfigurationParameterMainnetTestnetChain ID4663 (0x1237)46630 (0xb626)Native Gas TokenETHETHBlock Explorerrobinhoodchain.blockscout.comexplorer.testnet.chain.robinhood.comLocal DevelopmentBashgit clone [https://github.com/miami0x/SniperMCP.git](https://github.com/miami0x/SniperMCP.git)
cd SniperMCP
npm install
cp .env.example .env.local
npm run dev
Environment VariablesVariableRequiredDescriptionNEXT_PUBLIC_CHAIN_ENVOptionalmainnet (default) or testnetNEXT_PUBLIC_ROBINHOOD_MAINNET_RPCOptionalCustom Robinhood Chain RPC endpointLLM_API_KEYOptionalOpenAI-compatible API key for LLM rule compilation (falls back to local parser if omitted)LLM_MODELOptionalModel identifier (default: gpt-4o-mini)Roadmap[x] V1: Live pool radar, AI rule compiler, pre-flight bytecode simulator, mobile tab terminal[ ] V2: Direct Uniswap router execution, FeeRouter contract (0.5% fee), real wallet PnL tracking[ ] V3: Telegram bot mirror for real-time rule triggers & 1-click panic sellBuilt for high-velocity on-chain research and execution. Always verify contracts before signing transactions.
