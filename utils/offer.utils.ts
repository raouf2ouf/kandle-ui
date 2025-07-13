import { CompleteOffer } from "@mangrovedao/mgv";

export type OfferWithCumulative = CompleteOffer & {
  cumulative: number;
};

export function buildCumulativeOffers(
  offers: CompleteOffer[],
  asks?: boolean | undefined,
): OfferWithCumulative[] {
  let sorted = offers || [];
  if (asks) {
    sorted = sorted.sort((a, b) => a.price - b.price);
  } else {
    sorted = sorted.sort((a, b) => b.price - a.price);
  }
  let cumulative = 0;

  return sorted.map((offer) => {
    cumulative += offer.total || offer.volume * offer.price;
    return {
      ...offer,
      cumulative,
    };
  });
}
