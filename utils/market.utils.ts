import { MarketParams } from "@mangrovedao/mgv";
import { Address } from "viem";

export type MarketParamsSimplified = {
  base: Address;
  quote: Address;
  tickSpacing: bigint;
};

export function formatMarketName(market: MarketParams): string {
  return `${market.base.symbol}/${market.quote.symbol}`;
}

export function getMarketKey(market: MarketParams): string {
  return `${market.base.address.toLowerCase()}-${market.quote.address.toLowerCase()}-${market.tickSpacing.toString()}`;
}

export function extractMarketGivenKey(
  key: string,
): MarketParamsSimplified | undefined {
  const [baseAddress, quoteAddress, tickSpacing] = key.split("-");
  if (!baseAddress || !quoteAddress || !tickSpacing) return undefined;
  return {
    base: baseAddress as Address,
    quote: quoteAddress as Address,
    tickSpacing: BigInt(tickSpacing),
  };
}
