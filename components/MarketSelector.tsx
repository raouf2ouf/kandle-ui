import { useCurrentMarket, useMarkets } from "@/hooks/useMarkets";
import {
  extractMarketGivenKey,
  formatMarketName,
  getMarketKey,
} from "@/utils/market.utils";
import { Select, Text } from "@radix-ui/themes";
import { useMemo } from "react";

export function MarketSelector() {
  const { data: markets } = useMarkets();
  const { currentMarket, setCurrentMarket } = useCurrentMarket();

  const currentMarketKey = useMemo(
    () => (currentMarket ? getMarketKey(currentMarket) : undefined),
    [currentMarket],
  );

  function handleMarketChange(key: string) {
    if (!key) return;
    const market = extractMarketGivenKey(key);
    if (market) {
      setCurrentMarket(market);
    }
  }

  return (
    <Select.Root value={currentMarketKey} onValueChange={handleMarketChange}>
      <Select.Trigger placeholder="Select a market" />
      <Select.Content>
        {markets.map((market) => (
          <Select.Item key={getMarketKey(market)} value={getMarketKey(market)}>
            <Text>{formatMarketName(market)}</Text>
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
