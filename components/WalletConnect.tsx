import { Badge, Button, Card, Flex, Text } from "@radix-ui/themes";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export const WalletConnect: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <Card variant="surface">
        <Flex align="center" gap="3">
          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">
              Connected Wallet
            </Text>
            <Text size="1" style={{ fontFamily: "monospace" }}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </Text>
          </Flex>
          {chain && (
            <Badge size="1" color="green" variant="soft">
              {chain.name}
            </Badge>
          )}
          <Button size="2" variant="soft" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </Flex>
      </Card>
    );
  }

  return (
    <Card>
      <Flex direction="column" gap="3" align="center">
        <Text size="4" weight="medium">
          Connect Your Wallet
        </Text>
        <Flex gap="2">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isPending}
              variant={connector.name === "MetaMask" ? "solid" : "soft"}
            >
              {isPending ? "Connecting..." : `Connect ${connector.name}`}
            </Button>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
};
