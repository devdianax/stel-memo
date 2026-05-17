import { defineChain } from "viem";

export const stellarTestnet = defineChain({
  id: 50312,
  name: "Stellar Testnet",
  nativeCurrency: {
    name: "XLM",
    symbol: "XLM",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network"] },
  },
  blockExplorers: {
    default: {
      name: "Stellar Testnet Explorer",
      url: "https://shannon-explorer.somnia.network",
    },
  },
  testnet: true,
});
