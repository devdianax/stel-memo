import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {

  solidity: "0.8.28",

  networks: {
    stellar: {
      url: process.env.STELLAR_RPC_URL || "https://dream-rpc.somnia.network",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
    },
  },

  sourcify: {
    enabled: false,
  },

  etherscan: {
    apiKey: {
      stellar: "empty",
    },
    customChains: [
      {
        network: "stellar",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network",
        },
      },
    ],
  },
};

export default config;