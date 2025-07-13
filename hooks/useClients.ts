import {
  mangroveActions,
  MangroveActionsDefaultParams,
  MarketParams,
  publicMarketActions,
} from "@mangrovedao/mgv";
import { useChainId, useClient } from "wagmi";
import { baseMangrove } from "@mangrovedao/mgv/addresses";
import { useMemo } from "react";
import { Address, createPublicClient, http } from "viem";
import { base, foundry } from "viem/chains";

// in case we need to do some hard wiring
export const useTargetChainId = () => {
  const chainId = useChainId();
  return chainId;
};

export function useMangroveAddresses(): MangroveActionsDefaultParams {
  // TODO/critical: add supported chains, just base for now to see the existing markets
  const chainId = useTargetChainId();
  switch (chainId) {
    case base.id:
      return baseMangrove;
    case foundry.id:
      return {
        mgv: process.env.NEXT_PUBLIC_MGV_ADDRESS as Address,
        mgvReader: process.env.NEXT_PUBLIC_MGV_READER_ADDRESS as Address,
        mgvOrder: process.env.NEXT_PUBLIC_MGV_READER_ADDRESS as Address,
        routerProxyFactory: process.env
          .NEXT_PUBLIC_MGV_READER_ADDRESS as Address,
        smartRouter: process.env.NEXT_PUBLIC_MGV_READER_ADDRESS as Address,
      };
  }
  return baseMangrove;
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
