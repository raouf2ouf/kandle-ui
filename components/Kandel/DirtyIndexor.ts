import { ENV } from "@/lib/env.config";
import { useAppDispatch } from "@/stores/hook";
import { setKandels } from "@/stores/kandel.slice";
import { addOffer } from "@/stores/offers.slice";
import { Kandel } from "@/types/kandel";
import { memo, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Address,
  decodeEventLog,
  erc20Abi,
  formatUnits,
  parseAbiItem,
  PublicClient,
} from "viem";
import { usePublicClient } from "wagmi";

const newKandelEvent = parseAbiItem(
  "event NewKandel(address indexed owner, bytes32 indexed baseQuoteOlKeyHash, bytes32 indexed quoteBaseOlKeyHash, address kandel)",
);

const indexKandelEvents = async (
  client: PublicClient,
  kandelSeederAddress: Address,
  fromBlock: bigint = 0n,
): Promise<Kandel[]> => {
  try {
    const latestBlock = await client.getBlockNumber();
    const logs = await client.getLogs({
      address: kandelSeederAddress,
      event: newKandelEvent,
      fromBlock,
      toBlock: latestBlock,
    });

    // Process events into KandelEvent objects
    const kandels: Kandel[] = logs.map((log) => {
      const { args } = decodeEventLog({
        abi: [newKandelEvent],
        data: log.data,
        topics: log.topics,
      });
      const { blockNumber, transactionHash } = log;

      return {
        owner: args.owner.toLowerCase(),
        kandelAddress: args.kandel.toLowerCase(),
        baseQuoteOlKeyHash: args.baseQuoteOlKeyHash,
        quoteBaseOlKeyHash: args.quoteBaseOlKeyHash,
        blockNumber: blockNumber?.toString() || "0",
        transactionHash: transactionHash || "0x",
        marketBaseToken: ENV.WETH_TOKEN_ADDRESS,
        marketBaseTokenDecimals: 18,
        marketQuoteToken: ENV.USDC_TOKEN_ADDRESS,
        marketQuoteTokenDecimals: 6,
      };
    });

    for (const kandel of kandels) {
      // TODO/critical fetch the market and not hard code tokens
      const baseBalance = await client.readContract({
        address: ENV.WETH_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [kandel.kandelAddress as Address],
      });
      const quoteBalance = await client.readContract({
        address: ENV.USDC_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [kandel.kandelAddress as Address],
      });
      kandel.baseBalance = Number(formatUnits(BigInt(baseBalance), 18));
      kandel.quoteBalance = Number(formatUnits(BigInt(quoteBalance), 6));
    }
    return kandels;
  } catch (error) {
    console.error("Error indexing Kandel events:", error);
  }
  return [];
};

function QuickAndDirtyIndexor() {
  const [catchup, setCatchup] = useState(true);
  const client = usePublicClient();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!client) return;
    const unwatch = client.watchEvent({
      address: ENV.KANDEL_SEEDER_ADDRESS,
      event: newKandelEvent,
      onLogs: (logs) => {
        logs.forEach((log) => {
          try {
            const { args } = decodeEventLog({
              abi: [newKandelEvent],
              data: log.data,
              topics: log.topics,
            });
            const { blockNumber, transactionHash } = log;

            const event: Kandel = {
              owner: args.owner.toLowerCase(),
              kandelAddress: args.kandel.toLowerCase(),
              baseQuoteOlKeyHash: args.baseQuoteOlKeyHash,
              quoteBaseOlKeyHash: args.quoteBaseOlKeyHash,
              blockNumber: blockNumber?.toString() || "0",
              transactionHash: transactionHash || "0x",
              marketBaseToken: ENV.WETH_TOKEN_ADDRESS,
              marketBaseTokenDecimals: 18,
              marketQuoteToken: ENV.USDC_TOKEN_ADDRESS,
              marketQuoteTokenDecimals: 6,
            };

            dispatch(addOffer(event));
            toast.success(
              `New Kandel created by ${event.owner}: ${event.kandelAddress}`,
            );
          } catch (e) {
            console.log("unsupported event", e, log);
          }
        });
      },
    });

    return unwatch;
  }, [client, dispatch]);

  useEffect(() => {
    if (!catchup || !client) return;
    indexKandelEvents(client, ENV.KANDEL_SEEDER_ADDRESS, 0n).then(
      (positions) => {
        dispatch(setKandels(positions));
      },
    );
    setCatchup(false);
  }, [client, catchup, dispatch]);

  return null;
}

export const DirtyIndextor = memo(QuickAndDirtyIndexor);
