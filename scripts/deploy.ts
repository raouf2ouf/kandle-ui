import { anvil } from "prool/instances";
import {
  createWalletClient,
  parseUnits,
  publicActions,
  testActions,
  type Address,
  type Hex,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { ipc } from "viem/node";
import { mangroveBytecode } from "../contracts/bytecode/mangrove";
import { MangroveABI } from "../contracts/abi/mangrove";
import { foundry } from "viem/chains";
import { kandelLibBytecode } from "../contracts/bytecode/kandelLib";
import { seederBytecode } from "../contracts/bytecode/seeder";
import { kandelSeederABI } from "../contracts/abi/kandelSeeder";
import { erc20Abi } from "../contracts/abi/erc20";
import { erc20 } from "../contracts/bytecode/erc20";
import { floatToFixed96x32 } from "../utils/math.utils";
import { readerBytecode } from "../contracts/bytecode/reader";
import { readerAbi } from "../contracts/abi/reader";
import { multicall3Bytecode } from "@/contracts/bytecode/multicall3";

const mnemonic = "test test test test test test test test test test test junk";

const instance = anvil({
  port: 8545,
  ipc: "/tmp/mangrove.ipc",
  mnemonic,
  stepsTracing: true,
});
await instance.start();
console.log("Connected to anvil");

const client = createWalletClient({
  transport: ipc("/tmp/mangrove.ipc"),
  account: mnemonicToAccount(mnemonic),
  chain: foundry,
})
  .extend(testActions({ mode: "anvil" }))
  .extend(publicActions);

// deploying mangrove
async function deployMangrove() {
  const tx = await client.deployContract({
    bytecode: mangroveBytecode,
    abi: MangroveABI,
    args: [client.account.address, 1n, 2_000_000n],
  });
  const receipt = await client.waitForTransactionReceipt({ hash: tx });
  if (!receipt.contractAddress) {
    throw new Error("Mangrove deployment failed");
  }
  console.log("Mangrove: ", receipt.contractAddress);
  return receipt.contractAddress;
}

async function deployReader(mangrove: Address) {
  const tx = await client.deployContract({
    bytecode: readerBytecode,
    abi: readerAbi,
    args: [mangrove],
  });
  const receipt = await client.waitForTransactionReceipt({ hash: tx });
  if (!receipt.contractAddress) {
    throw new Error("Reader deployment failed");
  }
  console.log("Reader: ", receipt.contractAddress);
  return receipt.contractAddress;
}

async function deployKandelSeeder(mangrove: Address) {
  const kandelLibTx = await client.deployContract({
    bytecode: kandelLibBytecode,
    abi: [],
  });
  const kandelLibReceipt = await client.waitForTransactionReceipt({
    hash: kandelLibTx,
  });
  if (!kandelLibReceipt.contractAddress) {
    throw new Error("KandelLib deployment failed");
  }
  const bytecode = seederBytecode.replace(
    /__\$[a-fA-F0-9]{34}\$__/g,
    kandelLibReceipt.contractAddress.slice(2),
  ) as Hex;
  const seederTx = await client.deployContract({
    bytecode,
    abi: kandelSeederABI,
    args: [mangrove, 128_000n],
  });
  const seederReceipt = await client.waitForTransactionReceipt({
    hash: seederTx,
  });
  if (!seederReceipt.contractAddress) {
    throw new Error("Seeder deployment failed");
  }
  console.log("Seeder: ", seederReceipt.contractAddress);
  return seederReceipt.contractAddress;
}

async function deployToken(name: string, symbol: string, decimals: number) {
  const tx = await client.deployContract({
    bytecode: erc20,
    abi: erc20Abi,
    args: [name, symbol, decimals],
  });
  const receipt = await client.waitForTransactionReceipt({ hash: tx });
  if (!receipt.contractAddress) {
    throw new Error("Token deployment failed");
  }
  const readDecimals = await client.readContract({
    address: receipt.contractAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });
  console.log(`${symbol}:`, receipt.contractAddress);
  console.log(`${symbol}:`, readDecimals);
  return receipt.contractAddress;
}

async function openMarket(
  mangrove: Address,
  reader: Address,
  base: Address,
  quote: Address,
  minBaseVolume: bigint,
  minQuoteVolume: bigint,
  fee: bigint = 1n,
  gasBase: bigint = 250_000n,
) {
  const tx1 = await client.writeContract({
    address: mangrove,
    abi: MangroveABI,
    functionName: "activate",
    args: [
      {
        outbound_tkn: base,
        inbound_tkn: quote,
        tickSpacing: 1n,
      },
      fee,
      floatToFixed96x32(Number(minBaseVolume) / 500_000),
      gasBase,
    ],
  });
  const tx1Receipt = await client.waitForTransactionReceipt({ hash: tx1 });
  console.log(`tx1 Status:`, tx1Receipt.status);

  const tx2 = await client.writeContract({
    address: mangrove,
    abi: MangroveABI,
    functionName: "activate",
    args: [
      {
        outbound_tkn: quote,
        inbound_tkn: base,
        tickSpacing: 1n,
      },
      fee,
      floatToFixed96x32(Number(minQuoteVolume) / 500_000),
      gasBase,
    ],
  });
  const tx2Receipt = await client.waitForTransactionReceipt({ hash: tx2 });
  console.log(`tx2 Status:`, tx2Receipt.status);
  const tx3 = await client.writeContract({
    address: reader,
    abi: readerAbi,
    functionName: "updateMarket",
    args: [
      {
        tkn0: base,
        tkn1: quote,
        tickSpacing: 1n,
      },
    ],
  });
  const tx3Receipt = await client.waitForTransactionReceipt({ hash: tx3 });
  console.log(`tx3 Status:`, tx3Receipt.status);
  console.log("openned market");
  return { tx1, tx2, tx3 };
}

async function mintToken(token: Address, amount: bigint) {
  const tx = await client.writeContract({
    address: token,
    abi: erc20Abi,
    functionName: "mint",
    args: [client.account.address, amount],
  });
  console.log("minted token");
  return tx;
}

async function main() {
  // Quick multicall3 local setup to keep using mgv lib
  await client.setCode({
    address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    bytecode: multicall3Bytecode,
  });

  const mangrove = await deployMangrove();
  const reader = await deployReader(mangrove);
  const seeder = await deployKandelSeeder(mangrove);
  const token0 = await deployToken("Wrapped Ether", "WETH", 18);
  const token1 = await deployToken("USDC", "USDC", 6);
  await openMarket(
    mangrove,
    reader,
    token0,
    token1,
    parseUnits("0.001", 18),
    parseUnits("1", 6),
  );
  await mintToken(token0, parseUnits("0.001", 18));
  await mintToken(token1, parseUnits("1", 6));

  console.log("Contract addresses:");
  console.log(`Mangrove:      ${mangrove}`);
  console.log(`Reader:        ${reader}`);
  console.log(`Kandel Seeder: ${seeder}`);
  console.log(`WETH:          ${token0}`);
  console.log(`USDC:          ${token1}`);
}

main().then(() => {
  console.log("done");
});

process.on("SIGINT", async () => {
  console.log("Stopping anvil");
  await instance.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Stopping anvil");
  await instance.stop();
  process.exit(0);
});
