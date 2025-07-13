"use client";

import { MarketSelector } from "@/components/MarketSelector";
import { OrderBook } from "@/components/OrderBook";

export default function Home() {
  return (
    <div>
      <MarketSelector />
      <OrderBook />
    </div>
  );
}
