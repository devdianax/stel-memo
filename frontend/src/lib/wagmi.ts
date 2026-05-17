import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { stellarTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [stellarTestnet],
  connectors: [injected()],
  transports: {
    [stellarTestnet.id]: http("https://dream-rpc.somnia.network"),
  },
});
