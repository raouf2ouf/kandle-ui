import { foundry } from "viem/chains";
import { createConfig, http, injected } from "wagmi";

export const config = createConfig({
  chains: [
    {
      ...foundry,
      contracts: {
        ...foundry.contracts,
        multicall3: {
          address: "0xcA11bde05977b3631167028862bE2a173976CA11",
          blockCreated: 0,
        },
      },
    },
    // /*base */
  ],
  connectors: [injected()],
  ssr: true,
  transports: {
    // /*[base.id]: http(),
    [foundry.id]: http(),
  },
});
