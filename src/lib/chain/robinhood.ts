import { defineChain, createPublicClient, http } from 'viem';

export const robinhoodMainnet = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ROBINHOOD_MAINNET_RPC || 'https://rpc.mainnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://robinhoodchain.blockscout.com' },
  },
});

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC || 'https://rpc.testnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Blockscout Testnet', url: 'https://explorer.testnet.chain.robinhood.com' },
  },
  testnet: true,
});

export const activeChain =
  process.env.NEXT_PUBLIC_CHAIN_ENV === 'testnet' ? robinhoodTestnet : robinhoodMainnet;

export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(process.env.ROBINHOOD_RPC_SECRET_URL || activeChain.rpcUrls.default.http[0]),
});
