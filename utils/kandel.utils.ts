type KandelErrors = {
  baseAmount?: string;
  quoteAmount?: string;
  minPrice?: string;
  maxPrice?: string;
  pricePoints?: string;
  stepSize?: string;
};
export type KandelValidationResult = {
  isValid: boolean;
  errors: KandelErrors;
};
export function validateKandelParams(
  baseAmount: number,
  quoteAmount: number,
  minPrice: number,
  maxPrice: number,
  pricePoints: number,
  stepSize: number,
): KandelValidationResult {
  const errors: KandelErrors = {};

  // Basic numeric validations
  if (!baseAmount || baseAmount <= 0) {
    errors.baseAmount = "Base amount must be greater than 0";
  }

  if (!quoteAmount || quoteAmount <= 0) {
    errors.quoteAmount = "Quote amount must be greater than 0";
  }

  if (!minPrice || minPrice <= 0) {
    errors.minPrice = "Min price must be greater than 0";
  }

  if (!maxPrice || maxPrice <= 0) {
    errors.maxPrice = "Max price must be greater than 0";
  }

  // Price range validation
  if (minPrice >= maxPrice) {
    errors.minPrice = "Max price must be greater than min price";
    errors.maxPrice = "Max price must be greater than min price";
  }

  // Price points validation
  if (pricePoints < 2) {
    errors.pricePoints = "Price points must be at least 2";
  }

  if (pricePoints > 50) {
    errors.pricePoints = "Price points should not exceed 50 for gas efficiency";
  }

  // Step size validation
  if (stepSize < 1) {
    errors.stepSize = "Step size must be at least 1";
  }

  if (stepSize >= pricePoints) {
    errors.stepSize = "Step size must be less than price points";
  }

  // Price range reasonableness check
  const priceRatio = maxPrice / minPrice;
  if (priceRatio > 10) {
    errors.minPrice =
      "Price range too wide - consider a smaller range for better capital efficiency";
    errors.maxPrice =
      "Price range too wide - consider a smaller range for better capital efficiency";
  }

  return {
    isValid: Object.values(errors).length === 0,
    errors,
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
