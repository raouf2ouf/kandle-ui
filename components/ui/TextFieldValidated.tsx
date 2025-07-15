import { CheckIcon, Cross2Icon, InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Badge,
  Flex,
  IconButton,
  Text,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { memo } from "react";

type Props = {
  title: string;
  value: number;
  error: string | undefined;
  onChange: (value: number) => void;
  tooltip?: string | undefined;
  int?: boolean | undefined;
  fixed?: boolean | undefined;
};
function TFV({ title, value, error, onChange, tooltip }: Props) {
  return (
    <Flex direction="column" gap="2" style={{ flex: 1 }}>
      <Flex align="center" gap="2">
        <Text size="2" as="div">
          {title}
        </Text>
        <Tooltip content={tooltip}>
          <IconButton size="1" variant="ghost" radius="full" color="gray">
            <InfoCircledIcon width="16" height="16" />
          </IconButton>
        </Tooltip>
      </Flex>
      <TextField.Root
        type="number"
        value={value}
        onChange={(e) => {
          onChange(Number(e.target.value || 0));
        }}
        style={{ flex: 1, padding: "10px 2px 10px 10px" }}
        size="2"
      >
        <TextField.Slot side="right">
          {error ? (
            <Badge color="red">
              <Cross2Icon width={16} height={16} />
            </Badge>
          ) : (
            <Badge color="jade">
              <CheckIcon width={16} height={16} />
            </Badge>
          )}
        </TextField.Slot>
      </TextField.Root>
      <Text color="red" size="1" as="div" style={{ height: "16px" }}>
        {error}
      </Text>
    </Flex>
  );
}

export const TextFieldValidated = memo(TFV);

// import { CheckIcon, Cross2Icon, InfoCircledIcon } from "@radix-ui/react-icons";
// import {
//   Badge,
//   Flex,
//   IconButton,
//   Text,
//   TextField,
//   Tooltip,
// } from "@radix-ui/themes";
// import { memo, useEffect, useRef, useState } from "react";

// type Props = {
//   title: string;
//   value: number;
//   error: string | undefined;
//   onChange: (value: number) => void;
//   tooltip?: string | undefined;
//   int?: boolean | undefined;
// };
// function TFV({ title, value, error, onChange, int = false, tooltip }: Props) {
//   const [dValue, setDValue] = useState<string>(value.toString());
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     console.log("trying to setting value to ", dValue);
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);

//     timeoutRef.current = setTimeout(() => {
//       console.log("setting value to ", dValue);
//       onChange(Number(dValue || 0));
//     }, 300);

//     return () => {
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     };
//   }, [dValue, onChange]);
//   return (
//     <Flex direction="column" gap="2" style={{ flex: 1 }}>
//       <Flex align="center" gap="2">
//         <Text size="2" as="div">
//           {title}
//         </Text>
//         <Tooltip content={tooltip}>
//           <IconButton size="1" variant="ghost" radius="full" color="gray">
//             <InfoCircledIcon width="16" height="16" />
//           </IconButton>
//         </Tooltip>
//       </Flex>
//       <TextField.Root
//         type="number"
//         value={dValue}
//         onChange={(e) => {
//           setDValue(e.target.value);
//         }}
//         style={{ flex: 1, padding: "10px 2px 10px 10px" }}
//         size="2"
//       >
//         <TextField.Slot side="right">
//           {error ? (
//             <Badge color="red">
//               <Cross2Icon width={16} height={16} />
//             </Badge>
//           ) : (
//             <Badge color="jade">
//               <CheckIcon width={16} height={16} />
//             </Badge>
//           )}
//         </TextField.Slot>
//       </TextField.Root>
//       <Text color="red" size="1" as="div" style={{ height: "16px" }}>
//         {error}
//       </Text>
//     </Flex>
//   );
// }

// export const TextFieldValidated = memo(TFV);
