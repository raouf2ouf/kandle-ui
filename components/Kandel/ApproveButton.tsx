import { useApprove } from "@/hooks/useApprove";
import { useAppSelector } from "@/stores/hook";
import { selectCurrentKandel } from "@/stores/kandel.slice";
import { Button } from "@radix-ui/themes";
import { memo } from "react";

type ApproveKandelProp = {
  variant?:
    | "classic"
    | "solid"
    | "soft"
    | "surface"
    | "outline"
    | "ghost"
    | undefined;
  size?: "1" | "2" | "3" | "4" | undefined;
  radius?: "small" | "none" | "medium" | "full" | "large" | undefined;
  amountBase: number;
  amountQuote: number;
};
const ApproveKandel = ({
  variant,
  size,
  radius,
  amountBase,
  amountQuote,
}: ApproveKandelProp) => {
  const kandel = useAppSelector(selectCurrentKandel);
  const {
    isApprovalNeeded: isBaseApprovalNeeded,
    approve: approveBase,
    isConfirming: isBaseConfirming,
  } = useApprove(
    kandel?.marketBaseToken,
    kandel?.kandelAddress,
    18,
    amountBase,
  );
  const {
    isApprovalNeeded: isQuoteApprovalNeeded,
    approve: approveQuote,
    isConfirming: isQuoteConfirming,
  } = useApprove(
    kandel?.marketQuoteToken,
    kandel?.kandelAddress,
    6,
    amountQuote,
  );

  return (
    <>
      {isBaseApprovalNeeded ? (
        <Button
          onClick={approveBase}
          disabled={isBaseConfirming}
          loading={isBaseConfirming}
          variant={variant}
          size={size}
          radius={radius}
        >
          approve WETH
        </Button>
      ) : (
        isQuoteApprovalNeeded && (
          <Button
            onClick={approveQuote}
            disabled={isQuoteConfirming}
            loading={isQuoteConfirming}
            variant={variant}
            size={size}
            radius={radius}
          >
            approve USDC
          </Button>
        )
      )}
    </>
  );
};

export const ApproveKandelButton = memo(ApproveKandel);
