import {
  buildCumulativeOffers,
  OfferWithCumulative,
} from "@/utils/offer.utils";
import { Card, Flex } from "@radix-ui/themes";
import { useMemo } from "react";
import { OffersSide } from "@/components/Offers";
import { useCurrentMarket, useMarketBook } from "@/hooks/useMarkets";

export function OrderBook() {
  const { data: book } = useMarketBook();
  const { currentMarket } = useCurrentMarket();

  const processedAsks: OfferWithCumulative[] = useMemo(() => {
    if (!book) return [];
    return buildCumulativeOffers(book.asks, true);
  }, [book]);

  const processedBids: OfferWithCumulative[] = useMemo(() => {
    if (!book) return [];
    return buildCumulativeOffers(book.bids, false);
  }, [book]);

  const maxCumulative = useMemo(() => {
    return Math.max(
      processedAsks[processedAsks.length - 1]?.cumulative || 0,
      processedBids[processedBids.length - 1]?.cumulative || 0,
    );
  }, [processedAsks, processedBids]);

  return (
    <Card>
      <Flex width="9">
        {currentMarket && (
          <>
            <OffersSide
              offers={processedAsks}
              market={currentMarket}
              reverse={false}
              maxCumulative={maxCumulative}
            />
            <OffersSide
              offers={processedBids}
              market={currentMarket}
              reverse={true}
              maxCumulative={maxCumulative}
            />
          </>
        )}
      </Flex>
    </Card>
  );
}
