import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { Address, erc20Abi, formatUnits, maxUint256, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

export const useApprove = (
  token?: string | Address | undefined,
  spender?: string | Address | undefined,
  decimals: number = 18,
  balance: number = 0.0001,
) => {
  const balanceInWei = useMemo(
    () => parseUnits((balance || 0.0001).toString(), decimals),
    [balance, decimals],
  );
  const [isApprovalNeeded, setIsApprovalNeeded] = useState<boolean>(true);
  const [allowance, setAllowance] = useState<string>("0");
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const { data: allowanceInWei, refetch: refetchAllowance } = useReadContract({
    address: token as Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address!, spender as `0x${string}`],
    query: {
      enabled: !!(address && token && spender),
    },
  });

  const checkApproval = useCallback(async () => {
    if (!address || !token || allowanceInWei === undefined) {
      setIsApprovalNeeded(true);
      return;
    }

    try {
      setIsApprovalNeeded(allowanceInWei < balanceInWei);
      if (allowanceInWei == maxUint256) {
        // setAllowance("∞");
        setAllowance("Infinity");
      } else {
        setAllowance(Number(formatUnits(allowanceInWei, decimals)).toFixed(2));
      }
    } catch (error) {
      console.error("Error checking approval:", error);
      setIsApprovalNeeded(true);
    }
  }, [address, token, balanceInWei, allowanceInWei]);

  const approve = useCallback(async () => {
    if (!address || !token || !spender) return;

    try {
      // TODO/critical: need to justify the need for max approval
      writeContract({
        address: token as Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender as Address, maxUint256],
      });
    } catch (error) {
      console.error("Error approving:", error);
      toast.error("Failed to approve token");
    }
  }, [writeContract, address, token, spender]);

  useEffect(() => {
    checkApproval();
  }, [checkApproval]);

  useEffect(() => {
    if (isConfirmed) {
      refetchAllowance();
    }
  }, [isConfirmed, refetchAllowance]);

  return { isApprovalNeeded, approve, isConfirming, allowance };
};
