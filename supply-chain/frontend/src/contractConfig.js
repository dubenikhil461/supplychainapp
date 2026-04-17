/**
 * filename: frontend/src/contractConfig.js
 * purpose: Shared frontend contract address and ABI configuration.
 * setup notes: Replace CONTRACT_ADDRESS after deploying contract.
 */
export const CONTRACT_ADDRESS = "0x29181bA99eCd8099509fA4842dc5d911dC27A57B"; // TODO: Replace CONTRACT_ADDRESS after deployment

export const ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: true, internalType: "address", name: "owner", type: "address" }
    ],
    name: "ProductCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "productId", type: "uint256" },
      { indexed: false, internalType: "string", name: "location", type: "string" },
      { indexed: false, internalType: "string", name: "status", type: "string" },
      { indexed: true, internalType: "address", name: "updatedBy", type: "address" }
    ],
    name: "StepAdded",
    type: "event"
  },
  {
    inputs: [
      { internalType: "uint256", name: "_productId", type: "uint256" },
      { internalType: "string", name: "_location", type: "string" },
      { internalType: "string", name: "_status", type: "string" }
    ],
    name: "addStep",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "string", name: "_name", type: "string" }
    ],
    name: "createProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
    name: "getProduct",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "address", name: "currentOwner", type: "address" },
          { internalType: "bool", name: "isCreated", type: "bool" }
        ],
        internalType: "struct SupplyChain.Product",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
    name: "getProductHistory",
    outputs: [
      {
        components: [
          { internalType: "string", name: "location", type: "string" },
          { internalType: "string", name: "status", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "address", name: "updatedBy", type: "address" }
        ],
        internalType: "struct SupplyChain.Step[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];
