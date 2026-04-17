/**
 * filename: frontend/src/contractConfig.js
 * purpose: Shared frontend contract address and ABI configuration.
 * setup notes: Replace CONTRACT_ADDRESS after deploying contract.
 */
export const CONTRACT_ADDRESS = "0x7A243252C9261f2ACA21e4eF5B9ddd01c9a4e47E"; // TODO: Replace CONTRACT_ADDRESS after deployment

export const ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
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
      { indexed: true, internalType: "address", name: "addr", type: "address" },
      { indexed: false, internalType: "enum SupplyChain.Role", name: "role", type: "uint8" }
    ],
    name: "RoleAssigned",
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
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "_addr", type: "address" },
      { internalType: "enum SupplyChain.Role", name: "_role", type: "uint8" }
    ],
    name: "assignRole",
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
  },
  {
    inputs: [{ internalType: "address", name: "_addr", type: "address" }],
    name: "getRole",
    outputs: [{ internalType: "enum SupplyChain.Role", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "roles",
    outputs: [{ internalType: "enum SupplyChain.Role", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  }
];
