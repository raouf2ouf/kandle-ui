import { useMarketBook } from "./useMarkets";

export function useKandelOffers(market: MarketParams | null) {
  const { address: userAddress } = useAccount();
  const { userPositions } = useKandelEvents();
  const { data: book } = useMarketBook();

  return useQuery({
    queryKey: [
      "kandelOffers",
      userAddress,
      market?.base.address,
      market?.quote.address,
      userPositions,
      book,
    ],
    queryFn: async (): Promise<Map<string, KandelOfferInfo>> => {
      const kandelOffers = new Map<string, KandelOfferInfo>();

      if (!userAddress || !market || !userPositions || !book) {
        return kandelOffers;
      }

      // Get all user's Kandel addresses for this market
      const relevantKandels = userPositions.filter(
        (position) =>
          position.market.base?.address === market.base.address &&
          position.market.quote?.address === market.quote.address,
      );

      if (relevantKandels.length === 0) {
        return kandelOffers;
      }

      // Check each offer in the book to see if it belongs to a Kandel
      const allOffers = [...book.asks, ...book.bids];

      for (const offer of allOffers) {
        // Check if this offer's maker is one of our Kandel contracts
        for (const kandel of relevantKandels) {
          if (offer.maker?.toLowerCase() === kandel.address.toLowerCase()) {
            kandelOffers.set(offer.id, {
              offerId: offer.id,
              kandelAddress: kandel.address,
              isKandelOffer: true,
              // We could calculate the Kandel index based on the offer's position
              // This would require understanding the geometric distribution
              kandelIndex: undefined,
            });
            break;
          }
        }
      }

      return kandelOffers;
    },
    enabled: !!userAddress && !!market && !!book,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useKandlerOfferStats(market: MarketParams | null) {
  const { data: kandelOffers } = useKandelOffers(market);
  const { data: book } = useMarketBook();
}
