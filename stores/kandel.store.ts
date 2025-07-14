import { create } from "zustand";
import { Address, PublicClient, parseAbiItem, decodeEventLog } from "viem";
import { MarketParams } from "@mangrovedao/mgv";

export interface KandelEvent {
  owner: Address;
  kandelAddress: Address;
  baseQuoteOlKeyHash: string;
  quoteBaseOlKeyHash: string;
  blockNumber: bigint;
  transactionHash: string;
  market?: MarketParams;
}

export interface KandelPosition {
  address: Address;
  owner: Address;
  market: MarketParams;
  createdAt: bigint;
  transactionHash: string;
  admin?: Address;
  baseBalance?: bigint;
  quoteBalance?: bigint;
  params?: {
    gasprice: bigint;
    gasreq: bigint;
    stepSize: bigint;
    pricePoints: bigint;
  };
  baseQuoteTickOffset?: bigint;
}

interface KandelStore {
  // State
  events: KandelEvent[];
  positions: KandelPosition[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setEvents: (events: KandelEvent[]) => void;
  setPositions: (positions: KandelPosition[]) => void;
  addEvent: (event: KandelEvent) => void;
  addPosition: (position: KandelPosition) => void;
  updatePosition: (address: Address, updates: Partial<KandelPosition>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;

  // Getters
  getPositionsByOwner: (owner: Address) => KandelPosition[];
  getPositionByAddress: (address: Address) => KandelPosition | undefined;

  // Async actions
  indexKandelEvents: (
    client: PublicClient,
    kandelSeederAddress: Address,
    fromBlock?: bigint,
  ) => Promise<void>;

  // Clear state
  reset: () => void;
}

export const useKandelStore = create<KandelStore>((set, get) => ({
  // Initial state
  events: [],
  positions: [],
  isLoading: false,
  isInitialized: false,
  error: null,

  // Basic setters
  setEvents: (events) => set({ events }),
  setPositions: (positions) => set({ positions }),
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),
  addPosition: (position) =>
    set((state) => ({
      positions: [...state.positions, position],
    })),
  updatePosition: (address, updates) =>
    set((state) => ({
      positions: state.positions.map((pos) =>
        pos.address.toLowerCase() === address.toLowerCase()
          ? { ...pos, ...updates }
          : pos,
      ),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),

  // Getters
  getPositionsByOwner: (owner) => {
    const { positions } = get();
    return positions.filter(
      (pos) => pos.owner.toLowerCase() === owner.toLowerCase(),
    );
  },

  getPositionByAddress: (address) => {
    const { positions } = get();
    return positions.find(
      (pos) => pos.address.toLowerCase() === address.toLowerCase(),
    );
  },

  // Main indexing function
  indexKandelEvents: async (client, kandelSeederAddress, fromBlock = 0n) => {
    try {
      set({ isLoading: true, error: null });

      // Get the latest block to determine the range
      const latestBlock = await client.getBlockNumber();

      // Define the NewKandel event ABI item
      const newKandelEvent = parseAbiItem(
        "event NewKandel(address indexed owner, bytes32 indexed baseQuoteOlKeyHash, bytes32 indexed quoteBaseOlKeyHash, address kandel)",
      );

      // Fetch all NewKandel events
      const logs = await client.getLogs({
        address: kandelSeederAddress,
        event: newKandelEvent,
        fromBlock,
        toBlock: latestBlock,
      });

      console.log(`Found ${logs.length} NewKandel events`, logs);

      // Process events into KandelEvent objects
      const events: KandelEvent[] = logs.map((log) => {
        const { args } = decodeEventLog({
          abi: [newKandelEvent],
          data: log.data,
          topics: log.topics,
        });
        const { blockNumber, transactionHash } = log;

        return {
          owner: args.owner,
          kandelAddress: args.kandel,
          baseQuoteOlKeyHash: args.baseQuoteOlKeyHash,
          quoteBaseOlKeyHash: args.quoteBaseOlKeyHash,
          blockNumber: blockNumber || 0n,
          transactionHash: transactionHash || "0x",
        };
      });

      // Convert events to positions (simplified for demo)
      const positions: KandelPosition[] = events.map((event) => ({
        address: event.kandelAddress,
        owner: event.owner,
        market: {} as MarketParams, // Will be populated later when market info is available
        createdAt: event.blockNumber,
        transactionHash: event.transactionHash,
      }));

      // Update store
      set({
        events,
        positions,
        isLoading: false,
        isInitialized: true,
      });

      console.log(`Indexed ${events.length} Kandel positions`);
    } catch (error) {
      console.error("Error indexing Kandel events:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  // Reset store
  reset: () =>
    set({
      events: [],
      positions: [],
      isLoading: false,
      isInitialized: false,
      error: null,
    }),
}));

// Helper to get markets from positions
export async function enrichPositionsWithMarkets(
  positions: KandelPosition[],
  availableMarkets: MarketParams[],
): Promise<KandelPosition[]> {
  return positions.map((position) => {
    // TODO/critical: Implement market matching logic
    const market = availableMarkets[0]; // Use first available market for demo

    return {
      ...position,
      market,
    };
  });
}

// Helper to subscribe to new events in real-time
export function subscribeToNewKandelEvents(
  client: PublicClient,
  kandelSeederAddress: Address,
  onNewEvent: (event: KandelEvent) => void,
) {
  const newKandelEvent = parseAbiItem(
    "event NewKandel(address indexed owner, bytes32 indexed baseQuoteOlKeyHash, bytes32 indexed quoteBaseOlKeyHash, address kandel)",
  );

  // Set up event listener for new events
  const unwatch = client.watchEvent({
    address: kandelSeederAddress,
    event: newKandelEvent,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { args } = decodeEventLog({
          abi: [newKandelEvent],
          data: log.data,
          topics: log.topics,
        });
        const { blockNumber, transactionHash } = log;

        const event: KandelEvent = {
          owner: args.owner,
          kandelAddress: args.kandel,
          baseQuoteOlKeyHash: args.baseQuoteOlKeyHash,
          quoteBaseOlKeyHash: args.quoteBaseOlKeyHash,
          blockNumber: blockNumber || 0n,
          transactionHash: transactionHash || "0x",
        };

        onNewEvent(event);
      });
    },
  });

  return unwatch;
}
