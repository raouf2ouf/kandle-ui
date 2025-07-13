import { foundry, base } from "viem/chains";
import { createConfig, http, injected } from "wagmi";

export const config = createConfig({
  chains: [base, foundry],
  connectors: [injected()],
  ssr: true,
  transports: {
    [base.id]: http(),
    [foundry.id]: http(),
  },
});
