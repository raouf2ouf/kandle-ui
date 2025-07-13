import { Address, isAddressEqual } from "viem";
import { useMangroveClient, useMarketClient } from "./useClients";
import { useQuery } from "@tanstack/react-query";
import { MarketParams } from "@mangrovedao/mgv";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { MarketParamsSimplified } from "@/utils/market.utils";

export function useMarkets() {
  // TODO/warning: hardcoded values for cashnesses that I DO NOT UNDERSTAND (for now)
  const client = useMangroveClient();

  return useQuery({
    queryKey: ["markets", client?.chain.id],
    queryFn: async () => {
      if (!client) return [];
      return client.getOpenMarkets({
        cashnesses: {
          WETH: 1000,
          WBTC: 2000,
          USDC: 1e6,
          USDT: 2e6,
          EURC: 0.5e6,
          cbBTC: 2000,
          cbETH: 500,
          wstETH: 600,
        },
        symbolOverrides: {
          "USD₮0": "USDT",
        },
      });
    },
    gcTime: 1000 * 60 * 60 * 24,
    initialData: [],
  });
}

export function useCurrentMarket(): {
  currentMarket: MarketParams | null;
  setCurrentMarket: (marketParams: MarketParamsSimplified) => void;
} {
  const { data: markets } = useMarkets();

  // TODO/improvement: this section is inspired by mangrove ui code, maybe we can do better?
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentMarket: MarketParams | null = useMemo(() => {
    const base = searchParams.get("base");
    const quote = searchParams.get("quote");
    const tickSpacing = searchParams.get("tickSpacing");
    if (!base || !quote || !tickSpacing)
      return markets.length > 0 ? markets[0] : null;
    const market = markets.find(
      (market) =>
        isAddressEqual(market.base.address, base as Address) &&
        isAddressEqual(market.quote.address, quote as Address) &&
        market.tickSpacing == BigInt(tickSpacing),
    );
    return market || null;
  }, [markets, searchParams]);

  const setCurrentMarket = useCallback(
    (marketParams: MarketParamsSimplified) => {
      const { base, quote, tickSpacing } = marketParams;
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("base", base);
      params.set("quote", quote);
      params.set("tickSpacing", tickSpacing.toString());
      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [searchParams, router, pathname],
  );

  return { currentMarket, setCurrentMarket };
}

export function useMarketBook() {
  const { currentMarket: market } = useCurrentMarket();
  const client = useMarketClient(market);

  return useQuery({
    queryKey: [
      "book",
      client?.chain?.id,
      market?.base.address.toString().toLowerCase(),
      market?.quote.address.toString().toLowerCase(),
    ],
    queryFn: async () => {
      if (!client) return null;
      return client.getBook({});
    },
    // refetchInterval: 2000,
  });
}
