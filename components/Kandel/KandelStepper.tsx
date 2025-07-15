import {
  Badge,
  Button,
  Code,
  DataList,
  Flex,
  IconButton,
  Text,
} from "@radix-ui/themes";
import { memo, useEffect, useMemo } from "react";
import styles from "./Kandel.module.css";
import { Address, formatUnits, zeroAddress } from "viem";
import {
  CheckIcon,
  CopyIcon,
  Cross2Icon as CrossIcon,
} from "@radix-ui/react-icons";
import { CreateKandelButton } from "./CreateKandelButton";
import { Kandel } from "@/types/kandel";
import { shortenAddress } from "@/utils/math.utils";
import { useCurrentMarket } from "@/hooks/useMarkets";
import { useBalance } from "wagmi";
import { useApprove } from "@/hooks/useApprove";
import { useAppDispatch } from "@/stores/hook";
import { updateKandel } from "@/stores/kandel.slice";
import { useKandelReserveBalances } from "@/hooks/useReserveBalance";

const Done = () => (
  <Badge
    color="jade"
    variant="soft"
    radius="full"
    style={{ marginRight: "8px" }}
  >
    <CheckIcon />
  </Badge>
);

const Failed = () => (
  <Badge
    color="red"
    variant="soft"
    radius="full"
    style={{ marginRight: "8px" }}
  >
    <CrossIcon />
  </Badge>
);

const Status = ({ status }: { status: boolean }) => {
  if (status) return <Done />;
  return <Failed />;
};

type Props = {
  kandel?: Kandel | null | undefined;
};
const KandelStepper: React.FC<Props> = ({ kandel }) => {
  const dispatch = useAppDispatch();
  const { currentMarket } = useCurrentMarket();
  const { data: kandelBaseBalance } = useBalance({
    address: kandel?.kandelAddress,
    token: currentMarket?.base.address,
  });
  const { data: kandelQuoteBalance } = useBalance({
    address: kandel?.kandelAddress,
    token: currentMarket?.base.address,
  });

  const { bid, ask } = useKandelReserveBalances(kandel?.kandelAddress);
  useEffect(() => {
    console.log("reeserve!!", bid, ask);
  }, [bid, ask]);

  const {
    isApprovalNeeded: isBaseApprovalNeeded,
    approve: approveBase,
    allowance: baseAllowance,
  } = useApprove(kandel?.marketBaseToken, kandel?.kandelAddress, 18);
  const {
    isApprovalNeeded: isQuoteApprovalNeeded,
    approve: approveQuote,
    allowance: quoteAllowance,
  } = useApprove(kandel?.marketQuoteToken, kandel?.kandelAddress, 6);

  const investedBase = useMemo(() => {
    return kandelBaseBalance
      ? Number(formatUnits(kandelBaseBalance.value, kandelBaseBalance.decimals))
      : 0;
  }, [kandelBaseBalance]);
  const investedQuote = useMemo(() => {
    return kandelQuoteBalance
      ? Number(
          formatUnits(kandelQuoteBalance.value, kandelQuoteBalance.decimals),
        )
      : 0;
  }, [kandelQuoteBalance]);

  const created = useMemo(() => {
    return !!kandel && !!kandel.kandelAddress;
  }, [kandel]);

  useEffect(() => {
    if (!kandel) return;
    const changes = {
      id: kandel.kandelAddress,
      changes: {} as Partial<Kandel>,
    };
    let shouldUpdate = false;
    if (kandel.needsBaseApproval != isBaseApprovalNeeded) {
      changes.changes.needsBaseApproval = isBaseApprovalNeeded;
      shouldUpdate = true;
    }
    if (kandel.needsQuoteApproval != isQuoteApprovalNeeded) {
      changes.changes.needsQuoteApproval = isQuoteApprovalNeeded;
      shouldUpdate = true;
    }
    if (shouldUpdate) {
      dispatch(updateKandel(changes));
    }
  }, [isBaseApprovalNeeded, isQuoteApprovalNeeded, dispatch, kandel]);
  const enoughGas = false;
  const nbrBids = 0;
  const nbrAsks = 0;

  return (
    <Flex justify="between" className={styles.steps_container}>
      <Flex className={styles.step} direction="column" align="center">
        <Text className={styles.circle} as="div">
          1
        </Text>
        <Text as="div">Create</Text>
        <DataList.Root size="1">
          <DataList.Item align="center">
            <DataList.Label>
              <Done />
              <Flex justify="center" align="center">
                <Text as="div">market</Text>
              </Flex>
            </DataList.Label>
            <DataList.Value>
              <Text>WETH/USDC</Text>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item align="center">
            <DataList.Label>
              <Status status={created} />
              <Flex justify="center" align="center">
                <Text as="div" align="center">
                  kandel
                </Text>
              </Flex>
            </DataList.Label>
            <DataList.Value>
              <Flex align="center" gap="2" minWidth="112px">
                {created ? (
                  <Flex align="center" gap="2">
                    <Code variant="ghost">
                      {shortenAddress(kandel?.kandelAddress)}
                    </Code>
                    <IconButton
                      size="1"
                      aria-label="Copy value"
                      color="gray"
                      variant="ghost"
                    >
                      <CopyIcon />
                    </IconButton>
                  </Flex>
                ) : (
                  <CreateKandelButton variant="soft" radius="full" size="1" />
                )}
              </Flex>
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Flex>
      <Flex className={styles.step} direction="column" align="center">
        <Text className={styles.circle} as="div">
          2
        </Text>
        <Text as="div">Approve</Text>
        <DataList.Root size="1">
          <DataList.Item align="center">
            <DataList.Label>
              <Status status={!isBaseApprovalNeeded} />
              <Flex justify="center" align="center">
                <Text as="div">WETH</Text>
              </Flex>
            </DataList.Label>
            <DataList.Value>
              {!isBaseApprovalNeeded ? (
                <Flex align="end" gap="2" justify="end">
                  <Text size="1" as="div">
                    {baseAllowance}
                  </Text>
                </Flex>
              ) : (
                <Button
                  variant="soft"
                  radius="full"
                  size="1"
                  disabled={!created}
                  onClick={approveBase}
                >
                  approve
                </Button>
              )}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item align="center">
            <DataList.Label>
              <Status status={!isQuoteApprovalNeeded} />
              <Flex justify="center" align="center">
                <Text as="div">USDC</Text>
              </Flex>
            </DataList.Label>
            <DataList.Value>
              {!isQuoteApprovalNeeded ? (
                <Flex align="center" gap="2">
                  <Text>{quoteAllowance}</Text>
                </Flex>
              ) : (
                <Button
                  variant="soft"
                  radius="full"
                  size="1"
                  disabled={!created}
                  onClick={approveQuote}
                >
                  approve
                </Button>
              )}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Flex>
      <Flex className={styles.step} direction="column" align="center">
        <Text className={styles.circle} as="div">
          3
        </Text>
        <Text as="div">Populate</Text>
        <DataList.Root size="1">
          <DataList.Item align="center">
            <DataList.Label>
              <Status status={enoughGas} />
              <Flex justify="center" align="center">
                <Text as="div">gas</Text>
              </Flex>
            </DataList.Label>
            <DataList.Value>
              <Flex align="end" gap="2" justify="end">
                <Text size="1" as="div">
                  0.02 ETH
                </Text>
              </Flex>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item align="center">
            <DataList.Label>
              <Status status={!!nbrBids || !!nbrAsks} />
              <Flex justify="center" align="center">
                <Text as="div">asks | bids</Text>
              </Flex>
            </DataList.Label>
            <DataList.Value>
              <Flex align="center" gap="2">
                <Badge>{nbrBids}</Badge>
                <Text>|</Text>
                <Badge>{nbrAsks}</Badge>
              </Flex>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item align="center">
            <DataList.Label>
              <Status status={investedBase > 0} />
              <Flex justify="center" align="center">
                <Text as="div">WETH invested</Text>
              </Flex>
            </DataList.Label>
            <DataList.Value>
              <Flex align="center" gap="2">
                {investedBase > 0 ? investedBase.toFixed(4) : investedBase}
              </Flex>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item align="center">
            <DataList.Label>
              <Status status={investedQuote > 0} />
              <Flex justify="center" align="center">
                <Text as="div">USDC invested</Text>
              </Flex>
            </DataList.Label>
            <DataList.Value>
              <Flex align="center" gap="2">
                {investedBase}
              </Flex>
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Flex>
    </Flex>
  );
};
export default memo(KandelStepper);
