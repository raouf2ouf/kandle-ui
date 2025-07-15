"use client";

import { DirtyIndextor } from "@/components/Kandel/DirtyIndexor";
import KandelsManager from "@/components/Kandel/KandelsManager";
import { MarketSelector } from "@/components/MarketSelector";
import { OrderBook } from "@/components/OrderBook";
import { TopToolbar } from "@/components/TopToolbar/TopToolbar";

export default function Home() {
  return (
    <div>
      <TopToolbar />
      <MarketSelector />
      <OrderBook />
      {/* <CreateKandelForm /> */}
      <KandelsManager />
      <DirtyIndextor />
    </div>
  );
}
