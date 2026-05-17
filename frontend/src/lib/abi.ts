export const STELMEMO_ABI = [
  {
    type: "function",
    name: "registerWill",
    inputs: [
      { name: "_beneficiary", type: "address" },
      { name: "_inactivePeriodSec", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "checkIn",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositXLM",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "depositToken",
    inputs: [
      { name: "_tokenAddress", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositNFT",
    inputs: [
      { name: "_nftContract", type: "address" },
      { name: "_tokenId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateBeneficiary",
    inputs: [{ name: "_newBeneficiary", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateInactiveperiod",
    inputs: [{ name: "_newPeriodSec", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deactive",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getWillInfo",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [
      { name: "beneficiary", type: "address" },
      { name: "lastCheckIn", type: "uint256" },
      { name: "inactivePeriod", type: "uint256" },
      { name: "deadlineTimestamp", type: "uint256" },
      { name: "executed", type: "bool" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStatus",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vaultXLM",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCheckInHistory",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "timestamp", type: "uint256" },
          { name: "blockNumber", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVaultHistory",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "actType", type: "uint8" },
          { name: "asset", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "blockNumber", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "WillRegistered",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "beneficiary", type: "address", indexed: true },
      { name: "deadlineMs", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CheckedIn",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "newDeadlineMs", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "WillExecuted",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "beneficiary", type: "address", indexed: true },
      { name: "executedAt", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "WillDeactivates",
    inputs: [{ name: "owner", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "BeneficiaryUpdated",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "newBeneficiary", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "DepositXLM",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DepositToken",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DepositNFT",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "nftContract", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "xlmAmount", type: "uint256", indexed: false },
    ],
  },
] as const;
