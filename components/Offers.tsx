import { OfferWithCumulative } from "@/utils/offer.utils";
import { formatPrice, formatVolume } from "@/utils/price.utils";
import { MarketParams } from "@mangrovedao/mgv";
import { BA } from "@mangrovedao/mgv/lib";
import { Flex, Text } from "@radix-ui/themes";

type OfferRowProps = {
  offer: OfferWithCumulative;
  maxCumulative: number;
};
export const OfferRow: React.FC<OfferRowProps> = ({ offer, maxCumulative }) => {
  return (
    <Flex
      direction="row"
      width="100%"
      style={{
        background:
          offer.ba == BA.asks
            ? `linear-gradient(to left,  var(--asks-color-bg) ${(offer.cumulative / maxCumulative) * 100}%, transparent ${(offer.cumulative / maxCumulative) * 100}%)`
            : `linear-gradient(to right, var(--bids-color-bg) ${(offer.cumulative / maxCumulative) * 100}%, transparent ${(offer.cumulative / maxCumulative) * 100}%)`,
      }}
    >
      {/* Price */}
      <Text
        align="center"
        as="div"
        style={{
          flex: 1,
          color:
            offer.ba == BA.asks ? "var(--asks-color)" : "var(--bids-color)",
        }}
      >
        {formatPrice(offer.price)}
      </Text>
      {/* Size */}
      <Text align="center" as="div" style={{ flex: 1 }}>
        {formatVolume(offer.volume)}
      </Text>
      {/* Total */}
      <Text align="center" as="div" style={{ flex: 1 }}>
        {formatVolume(offer.total)}
      </Text>
    </Flex>
  );
};

type OfferSideProps = {
  offers: OfferWithCumulative[];
  market: MarketParams;
  reverse?: boolean | undefined;
  maxCumulative: number;
};
export const OffersSide: React.FC<OfferSideProps> = ({
  offers,
  market,
  reverse,
  maxCumulative,
}) => {
  return (
    <Flex direction="column" width="100%" dir={reverse ? `ltr` : `rtl`}>
      <Flex direction="row">
        <Text align="center" as="div" style={{ flex: 1 }}>
          Price
        </Text>

        <Text align="center" as="div" style={{ flex: 1 }}>
          Amount [{market.base.symbol}]
        </Text>
        <Text align="center" as="div" style={{ flex: 1 }}>
          Total [{market.quote.symbol}]
        </Text>
      </Flex>
      {offers.map((offer) => (
        <OfferRow key={offer.id} offer={offer} maxCumulative={maxCumulative} />
      ))}
    </Flex>
  );
};
