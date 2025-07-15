import { useCallback, useEffect } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useCurrentMarket } from "./useMarkets";
import { ENV } from "@/lib/env.config";
import { kandelSeederABI } from "@/contracts/abi/kandelSeeder";
import { Address, decodeEventLog, parseAbiItem } from "viem";
import { useAppDispatch } from "@/stores/hook";
import { setCurrentKandelAddress } from "@/stores/kandel.slice";

export function useCreateKandel() {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const { currentMarket: market } = useCurrentMarket();

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const {
    isLoading,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash });

  const createKandel = useCallback(() => {
    if (!market || !address) return;

    writeContract({
      address: ENV.KANDEL_SEEDER_ADDRESS,
      abi: kandelSeederABI,
      functionName: "sow",
      args: [
        {
          outbound_tkn: market.base.address,
          inbound_tkn: market.quote.address,
          tickSpacing: market.tickSpacing,
        },
        false, // liquiditySharing
      ],
    });
  }, [market, writeContract, address]);

  useEffect(() => {
    if (!hash || !receipt) return;
    try {
      // Define the NewKandel event ABI
      const newKandelEvent = parseAbiItem(
        "event NewKandel(address indexed owner, bytes32 indexed baseQuoteOlKeyHash, bytes32 indexed quoteBaseOlKeyHash, address kandel)",
      );

      // Find the NewKandel event in the logs
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: [newKandelEvent],
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "NewKandel") {
            const kandelAddress = decoded.args.kandel as Address;
            dispatch(setCurrentKandelAddress(kandelAddress));
          }
        } catch (e) {
          continue;
        }
      }
    } catch (error) {
      console.error("Error extracting Kandel address from receipt:", error);
    }
  }, [hash, receipt, dispatch]);

  return {
    createKandel,
    isLoading: isLoading || isPending,
    error,
    isSuccess,
  };
}
