import { Flex, RadioCards, Text } from "@radix-ui/themes";
import { memo } from "react";
import KandelDisplay from "./KandelDisplay";
import { useAccount } from "wagmi";
import { useAppDispatch, useAppSelector } from "@/stores/hook";
import {
  selectCurrentKandel,
  selectKandelsOfOwner,
  setCurrentKandelAddress,
} from "@/stores/kandel.slice";

const KandelsManager: React.FC = () => {
  const { address: userAddress } = useAccount();
  const userKandels = useAppSelector((state) =>
    selectKandelsOfOwner(state, userAddress),
  );
  const currentKandel = useAppSelector(selectCurrentKandel);
  const dispatch = useAppDispatch();

  return (
    <Flex direction="row">
      {/* Left: TabList */}
      <Flex maxWidth="200px">
        <RadioCards.Root
          defaultValue={
            currentKandel ? currentKandel.kandelAddress.toLowerCase() : "create"
          }
          onValueChange={(value) => {
            if (value === "create") {
              dispatch(setCurrentKandelAddress(null));
            } else {
              dispatch(setCurrentKandelAddress(value));
            }
          }}
        >
          {userKandels.map((k) => (
            <RadioCards.Item
              key={k.kandelAddress}
              value={k.kandelAddress.toLowerCase()}
            >
              <Flex direction="column" width="100%">
                <Text>{k.kandelAddress}</Text>
              </Flex>
            </RadioCards.Item>
          ))}
          <RadioCards.Item value="create">
            <Flex direction="column" width="100%">
              <Text>Create New Kandel</Text>
            </Flex>
          </RadioCards.Item>
        </RadioCards.Root>
      </Flex>

      {/* Right: TabContent */}
      <Flex direction="column" width="100%">
        <KandelDisplay />
      </Flex>
    </Flex>
  );
};

export default memo(KandelsManager);
