import { useReadContract } from "wagmi";
import { kandelABI } from "@/contracts/abi/kandel";
import { useMemo } from "react";

export function useKandelReserveBalances(kandelAddress?: `0x${string}`) {
  const enabled = Boolean(kandelAddress);

  const bidReserve = useReadContract({
    address: kandelAddress,
    abi: kandelABI,
    functionName: "reserveBalance",
    args: [0], // 0 = bid
    query: {
      enabled,
      select: (data) => BigInt(data),
    },
  });

  const askReserve = useReadContract({
    address: kandelAddress,
    abi: kandelABI,
    functionName: "reserveBalance",
    args: [1], // 1 = ask
    query: {
      enabled,
      select: (data) => BigInt(data),
    },
  });

  const isLoading = bidReserve.isLoading || askReserve.isLoading;
  const isError = bidReserve.isError || askReserve.isError;

  return useMemo(
    () => ({
      bid: bidReserve.data,
      ask: askReserve.data,
      isLoading,
      isError,
      error: bidReserve.error || askReserve.error,
    }),
    [
      bidReserve.data,
      askReserve.data,
      isLoading,
      isError,
      bidReserve.error,
      askReserve.error,
    ],
  );
}
