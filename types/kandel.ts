import { MarketParams } from "@mangrovedao/mgv";
import { Address } from "viem";

export interface KandelEvent {
  owner: Address;
  kandelAddress: Address;
  baseQuoteOlKeyHash: string;
  quoteBaseOlKeyHash: string;
  blockNumber: bigint;
  transactionHash: string;
  market?: MarketParams;
}

export interface KandelPosition {
  address: Address;
  owner: Address;
  market: MarketParams;
  createdAt: number;
  transactionHash: string;
  admin?: Address;
  baseBalance?: bigint;
  quoteBalance?: bigint;
  params?: {
    gasprice: bigint;
    gasreq: bigint;
    stepSize: bigint;
    pricePoints: bigint;
  };
  baseQuoteTickOffset?: bigint;
}
