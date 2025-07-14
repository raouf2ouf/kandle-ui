export const kandelABI = [
  {
    type: "function",
    name: "populateFromOffset",
    inputs: [
      { name: "from", type: "uint256", internalType: "uint256" },
      { name: "to", type: "uint256", internalType: "uint256" },
      { name: "baseQuoteTickIndex0", type: "int24", internalType: "Tick" },
      {
        name: "_baseQuoteTickOffset",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "firstAskIndex", type: "uint256", internalType: "uint256" },
      { name: "bidGives", type: "uint256", internalType: "uint256" },
      { name: "askGives", type: "uint256", internalType: "uint256" },
      {
        name: "parameters",
        type: "tuple",
        internalType: "struct CoreKandel.Params",
        components: [
          { name: "gasprice", type: "uint256", internalType: "uint256" },
          { name: "gasreq", type: "uint256", internalType: "uint256" },
          { name: "stepSize", type: "uint256", internalType: "uint256" },
          { name: "pricePoints", type: "uint256", internalType: "uint256" },
        ],
      },
      { name: "baseAmount", type: "uint256", internalType: "uint256" },
      { name: "quoteAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "retractAndWithdraw",
    inputs: [
      { name: "from", type: "uint256", internalType: "uint256" },
      { name: "to", type: "uint256", internalType: "uint256" },
      { name: "baseAmount", type: "uint256", internalType: "uint256" },
      { name: "quoteAmount", type: "uint256", internalType: "uint256" },
      { name: "freeWei", type: "uint256", internalType: "uint256" },
      { name: "recipient", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawFunds",
    inputs: [
      { name: "baseAmount", type: "uint256", internalType: "uint256" },
      { name: "quoteAmount", type: "uint256", internalType: "uint256" },
      { name: "recipient", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositFunds",
    inputs: [
      { name: "baseAmount", type: "uint256", internalType: "uint256" },
      { name: "quoteAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "admin",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "reserveBalance",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "params",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct CoreKandel.Params",
        components: [
          { name: "gasprice", type: "uint256", internalType: "uint256" },
          { name: "gasreq", type: "uint256", internalType: "uint256" },
          { name: "stepSize", type: "uint256", internalType: "uint256" },
          { name: "pricePoints", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "baseQuoteTickOffset",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getOffer",
    inputs: [
      { name: "ba", type: "uint256", internalType: "enum BA" },
      { name: "index", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Offer",
        components: [
          { name: "prev", type: "uint256", internalType: "uint256" },
          { name: "next", type: "uint256", internalType: "uint256" },
          { name: "wants", type: "uint256", internalType: "uint256" },
          { name: "gives", type: "uint256", internalType: "uint256" },
        ],
      },
      {
        name: "",
        type: "tuple",
        internalType: "struct OfferDetail",
        components: [
          { name: "maker", type: "address", internalType: "address" },
          { name: "gasreq", type: "uint256", internalType: "uint256" },
          { name: "offer_gasbase", type: "uint256", internalType: "uint256" },
          { name: "gasprice", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "SetParams",
    inputs: [
      {
        name: "value",
        type: "tuple",
        indexed: false,
        internalType: "struct CoreKandel.Params",
        components: [
          { name: "gasprice", type: "uint256", internalType: "uint256" },
          { name: "gasreq", type: "uint256", internalType: "uint256" },
          { name: "stepSize", type: "uint256", internalType: "uint256" },
          { name: "pricePoints", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetBaseQuoteTickOffset",
    inputs: [
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;
