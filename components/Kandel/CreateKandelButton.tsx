import { useCreateKandel } from "@/hooks/useCreateKandel";
import { Button } from "@radix-ui/themes";
import { memo, useEffect } from "react";
import { toast } from "react-toastify";

type CreateKandelProp = {
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
};
const CreateKandel = ({ variant, size, radius }: CreateKandelProp) => {
  const { createKandel, isLoading, error } = useCreateKandel();

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  return (
    <Button
      onClick={createKandel}
      disabled={isLoading}
      loading={isLoading}
      variant={variant}
      size={size}
      radius={radius}
    >
      Create Kandel
    </Button>
  );
};

export const CreateKandelButton = memo(CreateKandel);
