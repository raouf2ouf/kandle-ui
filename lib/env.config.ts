import { Address } from "viem";

export const ENV = {
  MGV_ADDRESS: (process.env.NEXT_PUBLIC_MGV_ADDRESS ||
    "0x5fbdb2315678afecb367f032d93f642f64180aa3") as Address,
  MGV_READER_ADDRESS: (process.env.NEXT_PUBLIC_MGV_READER_ADDRESS ||
    "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512") as Address,
  KANDEL_SEEDER_ADDRESS: (process.env.NEXT_PUBLIC_KANDEL_SEEDER_ADDRESS ||
    "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9") as Address,
  WETH_TOKEN_ADDRESS: (process.env.NEXT_PUBLIC_WETH_TOKEN_ADDRESS ||
    "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9") as Address,
  USDC_TOKEN_ADDRESS: (process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS ||
    "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707") as Address,
};
