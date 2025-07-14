import { memo, useState } from "react";
import KandelPriceChart from "./KandelPriceChart";
import { Button, Flex, TextField, Text, Slider } from "@radix-ui/themes";
import KandelStepper from "./KandelStepper";

const KandelDisplay: React.FC = () => {
  const currentPrice = 1000;
  const [minPrice, setMinPrice] = useState(800);
  const [maxPrice, setMaxPrice] = useState(1200);
  const [stepSize, setStepSize] = useState(1);

  const [tkn1InvestAmount, setTkn1InvestAmount] = useState(1200);
  const [tkn2InvestAmount, setTkn2InvestAmount] = useState(1200);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <KandelStepper />
      <KandelPriceChart
        currentPrice={currentPrice}
        initialMin={minPrice}
        initialMax={maxPrice}
        onMaxChange={(v) => {
          setMaxPrice(v);
        }}
        onMinChange={(v) => setMinPrice(v)}
      />
      {/* price bounds */}
      <Flex>
        <Flex direction="column" gap="2">
          <Text size="2">Min Price</Text>
          <Flex gap="2" align="center">
            <TextField.Root
              type="number"
              value={minPrice}
              onChange={(e) => {
                console.log(e.target.value);
                setMinPrice(Number(e.target.value || 0));
              }}
              style={{ flex: 1 }}
            />
            <Button type="button" variant="soft" size="1">
              Max
            </Button>
          </Flex>
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="2">Max Price</Text>
          <Flex gap="2" align="center">
            <TextField.Root
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value || 0));
              }}
              style={{ flex: 1 }}
            />
            <Button type="button" variant="soft" size="1">
              Max
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {/* steps */}
      <Flex>
        <Text size="2">Steps</Text>
        <Slider defaultValue={[10]} radius="none" min={2} max={10} />
        <Flex direction="column" gap="2">
          <Text size="2">Step Size</Text>
          <Flex gap="2" align="center">
            <TextField.Root
              type="number"
              value={stepSize}
              onChange={(e) => {
                setStepSize(Number(e.target.value || 1));
              }}
              style={{ flex: 1 }}
            />
            <Button type="button" variant="soft" size="1">
              Max
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {/* price bounds */}
      <Flex>
        <Flex direction="column" gap="2">
          <Text size="2">WETH Amount</Text>
          <Flex gap="2" align="center">
            <TextField.Root
              type="number"
              value={tkn1InvestAmount}
              onChange={(e) => {
                console.log(e.target.value);
                setTkn1InvestAmount(Number(e.target.value || 0));
              }}
              style={{ flex: 1 }}
            />
            <Button type="button" variant="soft" size="1">
              Max
            </Button>
          </Flex>
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="2">USDC Amount</Text>
          <Flex gap="2" align="center">
            <TextField.Root
              type="number"
              value={tkn2InvestAmount}
              onChange={(e) => {
                setTkn2InvestAmount(Number(e.target.value || 0));
              }}
              style={{ flex: 1 }}
            />
            <Button type="button" variant="soft" size="1">
              Max
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};

export default memo(KandelDisplay);
