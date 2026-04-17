/**
 * filename: backend/contract.js
 * purpose: Creates an ethers v6 contract instance for backend routes.
 * setup notes: Replace CONTRACT_ADDRESS after running deployment script.
 */
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
const ABI = [
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
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "productHistory",
    outputs: [
      { internalType: "string", name: "location", type: "string" },
      { internalType: "string", name: "status", type: "string" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "address", name: "updatedBy", type: "address" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "products",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "address", name: "currentOwner", type: "address" },
      { internalType: "bool", name: "isCreated", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

const CONTRACT_ADDRESS = "0x29181bA99eCd8099509fA4842dc5d911dC27A57B"; // TODO: Replace CONTRACT_ADDRESS after deployment

async function getContract() {
  try {
    const signer = await provider.getSigner(0);
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  } catch (error) {
    throw new Error(`Failed to initialize contract: ${error.message}`);
  }
}

module.exports = { getContract, ABI };
