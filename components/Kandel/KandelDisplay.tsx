import { memo, useMemo, useState } from "react";
import KandelPriceChart from "./KandelPriceChart";
import {
  Flex,
  Text,
  Slider,
  Tooltip,
  IconButton,
  Button,
} from "@radix-ui/themes";
import KandelStepper from "./KandelStepper";
import { useCurrentMarket } from "@/hooks/useMarkets";
import { validateKandelParams } from "@/utils/kandel.utils";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { TextFieldValidated } from "../ui/TextFieldValidated";
import { useAppSelector } from "@/stores/hook";
import { selectCurrentKandel } from "@/stores/kandel.slice";
import { Distribution } from "@mangrovedao/mgv";
import {
  calculatePopulateParams,
  usePopulateKandel,
} from "@/hooks/usePopulateKandel";
import { ApproveKandelButton } from "./ApproveButton";

const KandelDisplay: React.FC = () => {
  const currentPrice = 1000;
  const { currentMarket } = useCurrentMarket();
  const kandel = useAppSelector(selectCurrentKandel);

  const { populateKandel, isLoading: isPopulating } = usePopulateKandel();

  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [minPrice, setMinPrice] = useState<number>(currentPrice * 0.8);
  const [maxPrice, setMaxPrice] = useState<number>(currentPrice * 1.2);
  const [pricePoints, setPricePoints] = useState(10);
  const [stepSize, setStepSize] = useState(1);
  // Calculate estimates and validation
  const estimates = useMemo(() => {
    const validation = validateKandelParams(
      baseAmount,
      quoteAmount,
      minPrice,
      maxPrice,
      pricePoints,
      stepSize,
    );
    if (
      !baseAmount ||
      !quoteAmount ||
      !minPrice ||
      !maxPrice ||
      !currentMarket
    ) {
      return {
        provision: null,
        validation,
        distribution: { asks: [], bids: [] } as Distribution,
      };
    }

    const calculatedParams = calculatePopulateParams({
      market: currentMarket,
      baseAmount: baseAmount.toString(),
      quoteAmount: quoteAmount.toString(),
      minPrice: minPrice.toString(),
      maxPrice: maxPrice.toString(),
      pricePoints,
      stepSize,
    });

    return {
      provision: calculatedParams.requiredProvision,
      validation,
      distribution: calculatedParams.distribution,
    };
  }, [
    baseAmount,
    quoteAmount,
    minPrice,
    maxPrice,
    pricePoints,
    stepSize,
    currentMarket,
  ]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <KandelStepper kandel={kandel} />
      <KandelPriceChart
        currentPrice={currentPrice}
        initialMin={minPrice}
        initialMax={maxPrice}
        onMaxChange={(v) => {
          setMaxPrice(v);
        }}
        onMinChange={(v) => setMinPrice(v)}
        distributionAsks={estimates?.distribution?.asks}
        distributionBids={estimates?.distribution?.bids}
      />
      {/* price bounds */}
      <Flex gap="2">
        <TextFieldValidated
          title="Min Price"
          value={minPrice}
          onChange={(v) => setMinPrice(v)}
          error={estimates?.validation.errors.minPrice}
        />

        <TextFieldValidated
          title="Max Price"
          value={maxPrice}
          onChange={(v) => setMaxPrice(v)}
          error={estimates?.validation.errors.maxPrice}
        />
      </Flex>
      {/* steps */}
      <Flex gap="4" align="center">
        <Flex style={{ flex: 1 }} direction="column">
          <Flex gap="2" align="center" style={{ marginBottom: "20px" }}>
            <Text size="2" as="div">
              Number of Offers ({pricePoints})
            </Text>

            <Tooltip content="Number of offers to be generated as bids and asks">
              <IconButton size="1" variant="ghost" radius="full" color="gray">
                <InfoCircledIcon width="16" height="16" />
              </IconButton>
            </Tooltip>
          </Flex>
          <Slider
            defaultValue={[pricePoints]}
            radius="none"
            min={2}
            max={50}
            onValueCommit={(value) => setPricePoints(value[0])}
          />
          <Text color="red" size="1" style={{ height: "16px" }}>
            {estimates?.validation.errors.pricePoints}
          </Text>
        </Flex>
        <TextFieldValidated
          title="Step Size"
          value={stepSize}
          onChange={(v) => setStepSize(v)}
          error={estimates?.validation.errors.stepSize}
          int={true}
        />
      </Flex>
      {/* price bounds */}
      <Flex gap="4">
        <TextFieldValidated
          title="WETH Amount to be invested"
          value={baseAmount}
          onChange={(v) => setBaseAmount(v)}
          error={estimates?.validation.errors.baseAmount}
        />
        <TextFieldValidated
          title="USDC Amount to be invested"
          tooltip="initial invested tokens"
          value={quoteAmount}
          onChange={(v) => setQuoteAmount(v)}
          error={estimates?.validation.errors.quoteAmount}
        />
      </Flex>
      <ApproveKandelButton amountQuote={quoteAmount} amountBase={baseAmount} />
      {currentMarket && (
        <Button
          disabled={!estimates?.validation.isValid}
          loading={isPopulating}
          onClick={(e) =>
            populateKandel({
              market: currentMarket,
              pricePoints,
              stepSize,
              baseAmount,
              quoteAmount,
              minPrice,
              maxPrice,
            })
          }
        >
          Populate Kandel
        </Button>
      )}
    </div>
  );
};

export default memo(KandelDisplay);
