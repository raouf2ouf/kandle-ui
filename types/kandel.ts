export interface Kandel {
  owner: string;
  kandelAddress: string;
  baseQuoteOlKeyHash: string;
  quoteBaseOlKeyHash: string;
  blockNumber: string;
  transactionHash: string;
  marketBaseToken: string | undefined;
  marketBaseTokenDecimals: number;
  marketQuoteToken: string | undefined;
  marketQuoteTokenDecimals: number;
  marketTickSpacing?: string | undefined;
  baseBalance?: number | undefined;
  quoteBalance?: number | undefined;
  needsBaseApproval?: boolean;
  needsQuoteApproval?: boolean;
}

export interface KandelPosition {
  address: string;
  owner: string;
  marketBaseToken?: string | undefined;
  marketQuoteToken?: string | undefined;
  marketTickSpacing?: string | undefined;
  createdAtBlock: string;
  transactionHash: string;
  admin?: string | undefined;
  baseBalance?: string | undefined;
  quoteBalance?: string | undefined;
  gasprice?: string | undefined;
  gasreq?: string | undefined;
  stepSize?: string | undefined;
  pricePoints?: string | undefined;
  baseQuoteTickOffset?: string;
}
