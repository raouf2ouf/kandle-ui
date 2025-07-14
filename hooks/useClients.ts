import {
  mangroveActions,
  MangroveActionsDefaultParams,
  MarketParams,
  publicMarketActions,
} from "@mangrovedao/mgv";
import { useChainId, useClient } from "wagmi";
import { baseMangrove } from "@mangrovedao/mgv/addresses";
import { useMemo } from "react";
import { Address, createPublicClient, http, zeroAddress } from "viem";
import { base, foundry } from "viem/chains";
import { ENV } from "@/lib/env.config";

// in case we need to do some hard wiring
export const useTargetChainId = () => {
  const chainId = useChainId();
  return chainId;
};

export function useMangroveAddresses(): MangroveActionsDefaultParams & {
  kandelSeeder: Address;
} {
  // TODO/critical: add supported chains, just base for now to see the existing markets
  const chainId = useTargetChainId();
  switch (chainId) {
    case base.id:
      return { ...baseMangrove, kandelSeeder: zeroAddress }; // TODO/critical: get kandel seeder address of base
    case foundry.id:
    default:
      return {
        mgv: ENV.MGV_ADDRESS,
        mgvReader: ENV.MGV_READER_ADDRESS as Address,
        mgvOrder: ENV.MGV_READER_ADDRESS as Address,
        kandelSeeder: ENV.KANDEL_SEEDER_ADDRESS as Address,
        routerProxyFactory: zeroAddress,
        smartRouter: zeroAddress,
      };
  }
}

// Use simple client for now;
// TODO/improvement: Implement chain/transport targeted client
export const useBaseClient = () => {
  const client = useClient();
  return client;
};

export function useMangroveClient() {
  // TODO/improvement: is this really better? creating a client just for this?
  const client = useBaseClient();
  const mvgParams = useMangroveAddresses();

  const mangroveClient = useMemo(() => {
    if (!client || !mvgParams) return null;
    return createPublicClient({
      chain: client.chain,
      transport: http(),
    }).extend(mangroveActions(mvgParams));
  }, [client, mvgParams]);

  return mangroveClient;
}

export function useMarketClient(market: MarketParams | null) {
  // TODO/improvement: This is does not look better, a client everytime market changes????
  const client = useBaseClient();
  const mvgParams = useMangroveAddresses();

  const marketClient = useMemo(() => {
    if (!market || !client || !mvgParams) return null;
    return createPublicClient({
      chain: client.chain,
      transport: http(),
    }).extend(publicMarketActions(mvgParams, market));
  }, [client, mvgParams, market]);

  return marketClient;
}
