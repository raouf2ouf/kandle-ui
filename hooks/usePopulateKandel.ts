import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseUnits } from "viem";
import { useAppDispatch, useAppSelector } from "@/stores/hook";
import {
  createGeometricDistribution,
  MarketParams,
  tickFromPrice,
} from "@mangrovedao/mgv";
import { calculateKandelProvision } from "@/utils/kandel.utils";
import { kandelABI } from "@/contracts/abi/kandel";
import { toast } from "react-toastify";
import { useTraceClient } from "./useClients";

export interface PopulateKandelParams {
  market: MarketParams;
  baseAmount: string | number;
  quoteAmount: string | number;
  minPrice: string | number;
  maxPrice: string | number;
  pricePoints: number;
  stepSize: number;
}

export function calculatePopulateParams(params: PopulateKandelParams) {
  const {
    market,
    baseAmount,
    quoteAmount,
    minPrice,
    maxPrice,
    pricePoints,
    stepSize,
  } = params;

  // Convert string amounts to bigint with proper decimals
  const baseAmountBigInt = parseUnits(
    baseAmount.toString(),
    market.base.decimals,
  );
  const quoteAmountBigInt = parseUnits(
    quoteAmount.toString(),
    market.quote.decimals,
  );

  // Calculate ticks from prices
  const baseQuoteTickIndex0 = tickFromPrice(Number(minPrice));
  const maxTick = tickFromPrice(Number(maxPrice));
  const tickOffset =
    Math.abs(Number(maxTick - baseQuoteTickIndex0)) / (pricePoints - 1);

  // Calculate first ask index (middle of the range)
  const firstAskIndex = Math.floor(pricePoints / 2);

  const bidGives = quoteAmountBigInt;
  const askGives = baseAmountBigInt;

  // Calculate provision needed
  const requiredProvision = calculateKandelProvision(pricePoints);

  // Create geometric distribution to get properly calculated parameters
  const distribution = createGeometricDistribution({
    baseQuoteTickIndex0: BigInt(baseQuoteTickIndex0),
    baseQuoteTickOffset: BigInt(Math.round(tickOffset)),
    firstAskIndex: BigInt(firstAskIndex),
    stepSize: BigInt(stepSize),
    pricePoints: BigInt(pricePoints),
    market,
    bidGives,
    askGives,
  });
  return {
    distribution: {
      asks: distribution.asks
        .filter((a) => a.gives > 0)
        .map((a) => ({ ...a, price: a.price / 10 ** 12 })),
      bids: distribution.bids
        .filter((b) => b.gives > 0)
        .map((a) => ({ ...a, price: a.price / 10 ** 12 })),
    },
    requiredProvision,
    pricePoints, // to
    baseQuoteTickIndex0, // baseQuoteTickIndex0
    tickOffset, // _baseQuoteTickOffset
    firstAskIndex, // firstAskIndex
    bidGives, // bidGives (quote total)
    askGives, // askGives (base total)
    baseAmountBigInt, // baseAmount to deposit
    quoteAmountBigInt, // quoteAmount to deposit
    stepSize,
  };
}

export function usePopulateKandel() {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const currentKandelAddress = useAppSelector(
    (state) => state.kandels.currentKandelAddress,
  );

  const [tx, setTx] = useState<string | undefined>(undefined);

  const { writeContractAsync, data: h, error, isPending } = useWriteContract();
  const {
    isLoading,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash: tx });

  const traceClient = usePublicClient();

  const populateKandel = useCallback(
    async (params: PopulateKandelParams) => {
      if (!address || !currentKandelAddress) {
        throw new Error("User not connected");
      }

      const calculatedParams = calculatePopulateParams(params);
      console.log("populatingFromOffset!!", currentKandelAddress);

      // Call populateFromOffset using the distribution parameters
      try {
        await traceClient?.simulateContract({
          address: currentKandelAddress!,
          abi: kandelABI,
          functionName: "populateFromOffset",
          args: [
            0n, // from
            BigInt(calculatedParams.pricePoints), // to
            Number(calculatedParams.baseQuoteTickIndex0), // baseQuoteTickIndex0
            BigInt(Math.round(calculatedParams.tickOffset)), // _baseQuoteTickOffset
            BigInt(calculatedParams.firstAskIndex), // firstAskIndex
            calculatedParams.bidGives, // bidGives (quote total)
            calculatedParams.askGives, // askGives (base total)
            {
              gasprice: 1000000000n, // 1 gwei
              gasreq: 250000n,
              stepSize: BigInt(calculatedParams.stepSize),
              pricePoints: BigInt(calculatedParams.pricePoints),
            },
            calculatedParams.baseAmountBigInt, // baseAmount to deposit
            calculatedParams.quoteAmountBigInt, // quoteAmount to deposit
          ],
          value: calculatedParams.requiredProvision,
        });
        const tx = await writeContractAsync({
          address: currentKandelAddress!,
          abi: kandelABI,
          functionName: "populateFromOffset",
          args: [
            0n, // from
            BigInt(calculatedParams.pricePoints), // to
            Number(calculatedParams.baseQuoteTickIndex0), // baseQuoteTickIndex0
            BigInt(Math.round(calculatedParams.tickOffset)), // _baseQuoteTickOffset
            BigInt(calculatedParams.firstAskIndex), // firstAskIndex
            calculatedParams.bidGives, // bidGives (quote total)
            calculatedParams.askGives, // askGives (base total)
            {
              gasprice: 1000000000n, // 1 gwei
              gasreq: 250000n,
              stepSize: BigInt(calculatedParams.stepSize),
              pricePoints: BigInt(calculatedParams.pricePoints),
            },
            calculatedParams.baseAmountBigInt, // baseAmount to deposit
            calculatedParams.quoteAmountBigInt, // quoteAmount to deposit
          ],
          value: calculatedParams.requiredProvision,
        });
        console.log("before receipt", tx);
        const receipt = await traceClient?.waitForTransactionReceipt({
          hash: tx,
        });
        console.log("receipt", receipt);

        // await traceClient!.traceCall({
        //   hash: tx,
        //   tracer: "callTracer",
        // });
      } catch (e) {
        console.log(e);
        console.log("error populating from simulate");
        console.log(e.name);
        console.log({ e });
      }
    },
    [address, writeContractAsync, currentKandelAddress, traceClient],
  );

  useEffect(() => {
    console.log("hash !!!", tx, receipt);
    if (!tx || !receipt) return;
    console.log("hash", tx, receipt);
    if (receipt.status == "reverted") {
      console.error("receipt", receipt);
    }
  }, [tx, receipt, dispatch]);

  useEffect(() => {
    console.log("error", error);
    if (error) {
      console.error(error);
      toast.error(error.message);
    }
  }, [error]);

  return {
    populateKandel,
    isLoading: isLoading || isPending,
    error,
    isSuccess,
  };
}
