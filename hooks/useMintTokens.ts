import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { erc20Abi } from "@/contracts/abi/erc20";
import { parseUnits, Address } from "viem";
import { ENV } from "@/lib/env.config";
import { useEffect } from "react";
import { toast } from "react-toastify";

export function useMintTokens() {
  const { address: userAddress } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintToken = (
    tokenAddress: Address,
    amount: string,
    decimals: number,
  ) => {
    if (!userAddress) {
      throw new Error("Wallet not connected");
    }

    const amountBigInt = parseUnits(amount, decimals);

    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "mint",
      args: [userAddress, amountBigInt],
    });
  };

  const mintBaseToken = (amount: string = "1") => {
    mintToken(ENV.WETH_TOKEN_ADDRESS, amount, 18);
  };

  const mintQuoteToken = (amount: string = "1000") => {
    mintToken(ENV.USDC_TOKEN_ADDRESS, amount, 6);
  };

  useEffect(() => {
    if (error) {
      console.log(error);
      toast.error("Failed to mint tokens");
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      console.log("Tokens minted successfully");
      toast.success("Tokens minted successfully");
    }
  }, [isSuccess]);

  return {
    mintToken,
    mintBaseToken,
    mintQuoteToken,
    isMinting: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
