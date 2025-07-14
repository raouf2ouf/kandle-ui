export interface KandelValidationResult {
  isValid: boolean;
  errors: string[];
}
export function validateKandelParams(
  baseAmount: string,
  quoteAmount: string,
  minPrice: string,
  maxPrice: string,
  pricePoints: number,
  stepSize: number,
): KandelValidationResult {
  const errors: string[] = [];

  // Basic numeric validations
  if (!baseAmount || parseFloat(baseAmount) <= 0) {
    errors.push("Base amount must be greater than 0");
  }

  if (!quoteAmount || parseFloat(quoteAmount) <= 0) {
    errors.push("Quote amount must be greater than 0");
  }

  if (!minPrice || parseFloat(minPrice) <= 0) {
    errors.push("Min price must be greater than 0");
  }

  if (!maxPrice || parseFloat(maxPrice) <= 0) {
    errors.push("Max price must be greater than 0");
  }

  // Price range validation
  if (parseFloat(minPrice) >= parseFloat(maxPrice)) {
    errors.push("Max price must be greater than min price");
  }

  // Price points validation
  if (pricePoints < 2) {
    errors.push("Price points must be at least 2");
  }

  if (pricePoints > 50) {
    errors.push("Price points should not exceed 50 for gas efficiency");
  }

  // Step size validation
  if (stepSize < 1) {
    errors.push("Step size must be at least 1");
  }

  if (stepSize >= pricePoints) {
    errors.push("Step size must be less than price points");
  }

  // Price range reasonableness check
  const priceRatio = parseFloat(maxPrice) / parseFloat(minPrice);
  if (priceRatio > 10) {
    errors.push(
      "Price range too wide - consider a smaller range for better capital efficiency",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function estimateKandelAPR(
  baseAmount: number,
  quoteAmount: number,
  minPrice: number,
  maxPrice: number,
  pricePoints: number,
  expectedVolume24h: number, // Expected 24h volume in quote token
): number {
  const midPrice = (minPrice + maxPrice) / 2;
  const totalValueInQuote = quoteAmount + baseAmount * midPrice;

  // Estimate average spread per offer
  const priceRange = maxPrice - minPrice;
  const averageSpread = priceRange / pricePoints;
  const spreadPercentage = averageSpread / midPrice;

  // Estimate daily returns based on volume and spread
  const turnoverRatio = expectedVolume24h / totalValueInQuote;
  const dailyReturn = turnoverRatio * spreadPercentage * 0.5; // 50% of spread captured on average

  // Annualize the return
  return dailyReturn * 365 * 100; // Convert to percentage
}

/**
 * Format Kandel position summary
 */
export interface KandelPositionSummary {
  totalValue: string;
  priceRange: string;
  midPrice: string;
  spreadPercentage: string;
  estimatedAPR: string;
}

export function formatKandelSummary(
  baseAmount: string,
  quoteAmount: string,
  minPrice: string,
  maxPrice: string,
  pricePoints: number,
  quoteSymbol: string = "USDC",
  expectedVolume24h: number = 10000,
): KandelPositionSummary {
  const baseNum = parseFloat(baseAmount) || 0;
  const quoteNum = parseFloat(quoteAmount) || 0;
  const minPriceNum = parseFloat(minPrice) || 0;
  const maxPriceNum = parseFloat(maxPrice) || 0;

  const midPrice = (minPriceNum + maxPriceNum) / 2;
  const totalValue = quoteNum + baseNum * midPrice;
  const priceRange = ((maxPriceNum - minPriceNum) / midPrice) * 100;
  const estimatedAPR = estimateKandelAPR(
    baseNum,
    quoteNum,
    minPriceNum,
    maxPriceNum,
    pricePoints,
    expectedVolume24h,
  );

  return {
    totalValue: `${totalValue.toFixed(2)} ${quoteSymbol}`,
    priceRange: `${priceRange.toFixed(1)}%`,
    midPrice: midPrice.toFixed(6),
    spreadPercentage: `${(priceRange / pricePoints).toFixed(2)}%`,
    estimatedAPR: `${estimatedAPR.toFixed(1)}%`,
  };
}

export function calculateKandelProvision(
  pricePoints: number,
  gasPerOffer: bigint = 250000n,
  gasPrice: bigint = 1000000000n, // 1 gwei
): bigint {
  const totalOffers = BigInt(pricePoints * 2); // bids + asks
  return gasPerOffer * gasPrice * totalOffers;
}
