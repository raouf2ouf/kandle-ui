import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { memo } from "react";
import { useMintTokens } from "@/hooks/useMintTokens";
import { ENV } from "@/lib/env.config";
import {
  Badge,
  Button,
  DropdownMenu,
  Flex,
  Separator,
  Text,
} from "@radix-ui/themes";
import { formatUnits } from "viem";

function Header() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { mintBaseToken, mintQuoteToken, isMinting } = useMintTokens();

  // Get user balances for current market
  const { data: baseBalance } = useBalance({
    query: {
      refetchInterval: 2000,
    },
    address: address,
    token: ENV.WETH_TOKEN_ADDRESS,
  });

  const { data: quoteBalance } = useBalance({
    query: {
      refetchInterval: 2000,
    },
    address: address,
    token: ENV.USDC_TOKEN_ADDRESS,
  });

  const { data: gasBalance } = useBalance({
    address: address,
  });

  const handleMintBase = () => {
    try {
      mintBaseToken("1");
    } catch (error) {
      console.error("Error minting base token:", error);
    }
  };

  const handleMintQuote = () => {
    try {
      mintQuoteToken("1000");
    } catch (error) {
      console.error("Error minting quote token:", error);
    }
  };

  return (
    <Flex
      justify="between"
      align="center"
      p="3"
      className="top-toolbar"
      style={{
        borderBottom: "1px solid var(--gray-6)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Left side - App title */}
      <Flex align="center" gap="3">
        <Text size="4" weight="bold">
          Kandel UI
        </Text>
      </Flex>

      {/* Right side - Wallet and actions */}
      <Flex align="center" gap="3">
        {/* Token Minting Buttons */}
        {isConnected && (
          <>
            <Flex direction="column" gap="1">
              <Button
                size="2"
                variant="soft"
                onClick={handleMintBase}
                disabled={isMinting}
                className="toolbar-button"
              >
                {isMinting ? "Minting..." : `Mint WETH`}
              </Button>
              {baseBalance && (
                <Text size="1" className="balance-display">
                  {formatUnits(baseBalance.value, baseBalance.decimals).slice(
                    0,
                    6,
                  )}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="1">
              <Button
                size="2"
                variant="soft"
                onClick={handleMintQuote}
                disabled={isMinting}
                className="toolbar-button"
              >
                {isMinting ? "Minting..." : `Mint USDC`}
              </Button>
              {quoteBalance && (
                <Text size="1" className="balance-display">
                  {formatUnits(quoteBalance.value, quoteBalance.decimals).slice(
                    0,
                    8,
                  )}
                </Text>
              )}
            </Flex>

            <Separator orientation="vertical" />
          </>
        )}

        {/* Wallet Connection */}
        {isConnected ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft" size="2" className="toolbar-button">
                <Flex align="center" gap="2">
                  <Badge size="1" color="green" variant="solid">
                    {chain?.name}
                  </Badge>
                  <Text size="2" style={{ fontFamily: "monospace" }}>
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </Text>
                </Flex>
              </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content className="wallet-dropdown">
              <DropdownMenu.Item disabled>
                <Flex direction="column" gap="1">
                  <Text size="2" weight="medium">
                    Connected Account
                  </Text>
                  <Text size="1" className="wallet-address">
                    {address}
                  </Text>
                </Flex>
              </DropdownMenu.Item>

              {chain && (
                <DropdownMenu.Item disabled>
                  <Flex align="center" gap="2">
                    <Badge size="1" color="blue" variant="soft">
                      {chain.name}
                    </Badge>
                    <Text size="1">Chain ID: {chain.id}</Text>
                  </Flex>
                </DropdownMenu.Item>
              )}

              <DropdownMenu.Separator />

              {baseBalance && quoteBalance && gasBalance && (
                <>
                  <DropdownMenu.Item disabled>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">
                        Balance
                      </Text>
                      <Text size="1">
                        Gas
                        {formatUnits(
                          gasBalance.value,
                          gasBalance.decimals,
                        ).slice(0, 8)}
                      </Text>
                    </Flex>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator />
                </>
              )}

              <DropdownMenu.Item onSelect={() => disconnect()}>
                <Text color="red">Disconnect</Text>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button
                size="2"
                disabled={isConnecting}
                className="toolbar-button"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content className="wallet-dropdown">
              <DropdownMenu.Item disabled>
                <Text size="2" weight="medium">
                  Choose Wallet
                </Text>
              </DropdownMenu.Item>

              <DropdownMenu.Separator />

              {connectors.map((connector) => (
                <DropdownMenu.Item
                  key={connector.uid}
                  onSelect={() => connect({ connector })}
                >
                  <Flex align="center" gap="2">
                    <Text size="2">{connector.name}</Text>
                    {connector.name === "MetaMask" && (
                      <Badge size="1" variant="soft" color="orange">
                        Recommended
                      </Badge>
                    )}
                  </Flex>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}
      </Flex>
    </Flex>
  );
}

export const TopToolbar = memo(Header);
