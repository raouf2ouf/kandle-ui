# Kandel Position Management Frontend - Technical Report

## TLDR;

This technical report documents the development of a frontend application for managing Kandel instances and positions on the Mangrove DEX. The core objectives of this test were **not achieved**, several technical challenges prevented full implementation of the position creation functionality (populateKandel).
This report details the understanding gained, implementation approach, challenges encountered, and proposed solutions that might be useful for the future.

## 1. Understanding of Mangrove Core Engine and Kandel Strategy

### Mangrove Core Engine

Mangrove differs from traditional AMMs by using an **order book with smart offers**:

**Key Concepts:**
- **Promise-Based Offers**: Instead of locking liquidity, offers are promises backed by smart contracts.
> **Comment:** `yes, however the liquidity is still held by the Kandel, wouldn't it be better to have the kandel syphon liquidity from the wallet on the moment of taking the offer? The kandel role would then be mainly to provide provisions in case the funds are not there.`

- **ETH Provisions**: Each offer requires ETH provision to cover gas costs if execution fails (`provision = gasRequired × gasPrice × numberOfOffers`)
> **Comment:** `This might be the main reason why I could not make populateFromOffset work, along with suspisions about the math behind bidGives and askGives <> baseAmount quoteAmount.`
- **Smart Contract Integration**: When taken, offers trigger smart contract logic enabling dynamic liquidity sourcing

### Kandel Strategy

Kandel implements **automated geometric market making**:

**Geometric Distribution:**
The generated price levels for bids and asks follow a geometric progression. it is used by the front to simulate the potential bids and asks the current Kandel will generate, and follows the same logic as the GeometricKandel contract.

**Automated Rebalancing:**
1. Capital split between bids/asks at `firstAskIndex`
2. When offer taken → new offer posted on opposite side
3. Creates "ladder effect" where inventory flows between tokens
4. Captures spreads through buy low/sell high cycles

**Example**: ETH/USDC range 1800-2200 with 10 points creates bids at [1800, 1844, 1889...] and asks at [2032, 2084, 2138...]. As market moves, taken offers trigger rebalancing to maintain offers (with geometric describution).

> **Comment:** `Overall a great idea! for future reference, I need to check how fees are computed for the protocol and for the kandel. This information will also be needed for correct APR estimations`.

## 2. Application Architecture and Flow

### User Interface Design

The application implements a **unified dashboard approach** where users can:

1. **View All Positions**: See all Kandel positions for the current market in a single interface
2. **Real-time Preview**: Visualize the geometric distribution before deployment
3. **Position Management**: Deploy new positions or update existing ones from the same view
> **Comment:** `I spent a lot of time understanding the consequences of calling populate on an already populated kandel. I still do not fully realize the implications on the Kandel, should all previous offers be rescended manually or would the contract take care of it automatically?`.

4. **Order Book Integration**: See how Kandel offers integrate with the live order book
> **Comment:** `A detailed indexing of the order book is crutial for correctly computing APR of Kandel strategies`.


### Key Features Implemented:

#### A. Market Selection and Order Book Visualization
- Dynamic market selection with base/quote token pairs
- Live order book display fetched directly from Mangrove using MgvReader
- Visual highlighting of user's Kandel offers within the order book
> **Comment:** `This is irrelevant since Kandels cannot be populated at the moment`.
- Real-time updates showing offer status and market depth
> **Comment:** `This is irrelevant since Kandels cannot be populated at the moment`.

#### B. Geometric Distribution Preview
```typescript
// Real-time calculation of offer placement
const distribution = createGeometricDistribution({
  baseQuoteTickIndex0: BigInt(baseQuoteTickIndex0),
  baseQuoteTickOffset: BigInt(tickOffset),
  firstAskIndex: BigInt(firstAskIndex),
  stepSize: BigInt(stepSize),
  pricePoints: BigInt(pricePoints),
  market,
  bidGives,
  askGives,
});
```

Users can see exactly where their bids and asks will be placed before committing capital.

#### C. Position Creation Interface
- Intuitive form with real-time validation
- Parameter inputs: price range, token amounts, price points, step size
- Automatic provision calculation based on gas requirements
- 'Smart' defaults based on current market conditions
> **Comment:** `Not really that smart since it is based on hardcoded values at the moment`.

#### D. Position Management Dashboard
- View existing Kandel positions with key metrics
- Current inventory levels (base/quote balances)
- Active offers count and distribution
<!-- - Performance tracking and rebalancing history -->

### Technical Implementation

> **Comment:** `Code quality has been sacrified early on to reach a basic MVP. the resulting code structure is a mess and I appologise for that`.

#### Hook-Based Architecture:
```typescript
// Core hooks for Kandel interaction
useKandelSeeder()     // Creation and population
useKandelEvents()     // Event monitoring and indexing
useKandelOffers()     // Live offer tracking
useMarketBook()       // Order book integration
```

#### State Management:
- Zustand for global Kandel position state
> **Comment:** `Switched to redux-store given time contraints and lack of familiarity with zustand. This also explains the abysmal performance time of the frontend`.
- React Query for server state and caching

## 3. Indexing Strategy: Pragmatic Demo Approach

Given the demo nature of this application, I implemented a **"dirty indexer"** approach for tracking Kandel positions and events:

### Event Monitoring System:

```typescript
// Monitor NewKandel events for position discovery
const kandelCreationEvents = await client.getLogs({
  address: kandelSeederAddress,
  event: parseAbiItem("event NewKandel(address,bytes32,bytes32,address)"),
  fromBlock: deploymentBlock
});

// Track offer success events for performance monitoring
const offerTakeEvents = await client.getLogs({
  address: mangroveAddress,
  event: parseAbiItem("event OfferSuccess(...)"),
  filter: { maker: userKandelAddresses }
});
```

### Frontend State Persistence:

Since original user parameters (minPrice, maxPrice, initial amounts) are **not stored on-chain**, I use try to build back the minPrice/maxPrice from existing offers. If there is no existing offer then I just take 0.8, 1.2 of the current price along with the current reserve as initial amounts.

### Hybrid Data Approach:
- **Events**: For discovering new positions and monitoring activity
- **Contract Calls**: For current state (balances, parameters, active offers)
- **Real-time Queries**: For live order book and market data

This approach provides sufficient functionality for a demo while acknowledging the limitations of not having a production indexing infrastructure.

## 4. Technical Challenges and Implementation Issues

### Primary Challenge: Population Function Failure

The core objective of enabling Kandel position creation was **not fully achieved** due to technical issues with the `populateFromOffset` function:

#### Issue Analysis:

**1. Gas Estimation Problems:**
Gas estimation for the required provisions where initially based on a simulation of offer execution. However, given I could not populate a Kandel, default values where used.
Initially I computed provisions as follows:
```typescript
// Gas estimation
  const provisions = gasPrice * gasRequired * numberOfOffers
  // also tried
  const provisions = gasPrice * gasRequired
  // also tried
  const provisions = 3 ether;
});
```
where both gasPrice and gasRequired where simple estimations. I then tried

**2. ABI/Bytecode Limitations:**
- Working with only ABI and bytecode (no source code) limited debugging capabilities
> **Comment:** `There was no guarantee that the bytecode I had was generated from the current version of Kandel contracts code in the repo. I should have recompiled them just to make sure.`.
- Unable to verify parameter encoding or internal function logic
- Difficult to distinguish between parameter errors vs. contract state issues
> **Comment:** `With more time, I might have been able to debug this. However, I currently do not possess the mental power to do so.`.

**3. Parameter Calculation Complexity:**

I did not manage to fully understand the `bidGives` and `askGives` parameters. Especially since `baseAmount` and `quoteAmount` were also included, I tried to 'guess' the number of bids and asks and divided the amounts equally. Or to use bidGives and askGives with the same value as amount. None of this worked.

```typescript
// Calculate number of bids and asks
const numBids = Math.ceil(pricePoints / 2);
const numAsks = Math.floor(pricePoints / 2);

const bidGives = numBids > 0 ? quoteAmountBigInt / BigInt(numBids) : 0n;
const askGives = numAsks > 0 ? baseAmountBigInt / BigInt(numAsks) : 0n;

// const bidGives = quoteAmountBigInt;
// const askGives = baseAmountBigInt;
// Uncertainty about parameter precision and edge cases
```


#### Debugging Attempts:

**1. Parameter Validation:**
- Verified tick calculations using `tickFromPrice` utility
- Confirmed provision calculations match expected gas costs
- Validated creation, token approvals, and balances before population

**2. Alternative Approaches:**
- Attempted different parameter combinations and ranges
- Tested with minimal configurations (fewer price points)
- Tried both `populateFromOffset` and direct `populate` functions

**3. Contract State Analysis:**
- Verified Kandel contract creation via `sow()` succeeded
- Confirmed admin permissions and contract ownership
- Checked Mangrove core contract compatibility

### Secondary Challenges:

#### A. Real-time Data Synchronization and Performance
- Lack of complete understanding of `Nextjs` prevented better optimisation of the front.
- Balancing real-time updates with state updates.

#### B. Complex State Management
- Coordinating multiple async data sources (events, contract calls, stores)
- Managing optimistic updates during transaction pending states
- Handling error states and retry logic

#### C. User Experience Considerations
- Providing meaningful feedback during long transaction times
- Explaining complex DeFi concepts (provisions, geometric distributions)
- Graceful degradation when certain features are unavailable
- Add some makeup to the UI.
> **Comment:** `This is my biggest regret, the front could have been so much better given some time`.


## 5. APR Calculation Methodology

### Token-Based Return Framework

I propose calculating two APR metrics:
- USD-based APR where prices are taken at the time of the trades.
- Balance-based APR where balances are taken at the time of the trades. Note that this would allow for better estimation of impermanent loss.

#### Implementation Strategy:

**Event-Based Tracking:**
```typescript
// Monitor OfferSuccess events for spread capture
const offerTakes = await publicClient.getLogs({
  address: mangroveAddress,
  event: parseAbiItem("event OfferSuccess(...)"),
  fromBlock: kandelDeploymentBlock
});

// Calculate individual spread captures
const spreadData = offerTakes.map(event => ({
  timestamp: event.blockTimestamp,
  spreadBps: calculateSpreadBps(event.args.takerWants, event.args.takerGives),
  volumeInQuote: normalizeToQuote(event.args.takerWants),
}));
```

**Time-Weighted Returns:**
```typescript
function calculateTimeWeightedAPR(snapshots: InventorySnapshot[]): number {
  let weightedReturn = 0;
  let totalWeight = 0;

  for (let i = 1; i < snapshots.length; i++) {
    const timeDiff = snapshots[i].timestamp - snapshots[i-1].timestamp;
    const periodReturn = calculateTotalReturn(snapshots[i-1], snapshots[i]);

    weightedReturn += periodReturn * timeDiff;
    totalWeight += timeDiff;
  }

  const averageReturn = weightedReturn / totalWeight;
  return (averageReturn * 365 * 24 * 3600) / totalWeight; // Annualize
}
```

### Performance Metrics Framework:

**Key Performance Indicators:**
- **Spread Capture Rate**: Number of spreads captured per day
- **Capital Efficiency**: Total volume traded / average inventory
- **Rebalancing Frequency**: How often the strategy adjusts positions
- **Impermanent Loss**: Token-denominated opportunity cost vs. holding
- **Provisions Used**: How much of the total provision has been used during the period.
- **Risk-Adjusted Returns:**

## 6. Future Development and Recommendations

### Immediate Fixes Required:

**1. Population Function Resolution:**
- Collaborate with Mangrove team to debug parameter encoding
- Access Kandel source code for better understanding
- Implement comprehensive testing with known working parameters

**2. Enhanced Error Handling:**
```typescript
// Robust error detection and user feedback
try {
  await kandel.populateFromOffset(...args);
} catch (error) {
  if (error.message.includes("provision")) {
    throw new Error("Insufficient ETH provision for gas costs");
  } else if (error.message.includes("approval")) {
    throw new Error("Token approval required before population");
  } else {
    throw new Error(`Population failed: ${error.message}`);
  }
}
```

## 8. Conclusion

This project demonstrates a comprehensive understanding of the Mangrove protocol and Kandel strategy, implementing a vision of a frontend that addresses most of the technical requirements. While the core population functionality remains unresolved due to technical challenges, the architecture and implementation approach provide a solid foundation for a production-ready Kandel management interface.

**Key Achievements:**
- ✅ Comprehensive protocol understanding and documentation
- ✅ Modern React/TypeScript architecture with wagmi/viem
- ✅ Real-time order book integration and offer visualization
- ✅ Geometric distribution calculation and preview
- ✅ Event monitoring and position tracking

**Outstanding Issues:**
- ❌ Population function integration requires further debugging
- ❌ Indexing system needed for scalability
- ❌ Comprehensive testing and error handling improvements required
