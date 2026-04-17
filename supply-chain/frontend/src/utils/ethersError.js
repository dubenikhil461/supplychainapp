/**
 * filename: frontend/src/utils/ethersError.js
 * purpose: Normalize ethers/MetaMask errors into user-readable messages.
 * setup notes: Used by pages that submit on-chain transactions via BrowserProvider.
 */

export function formatEthersError(error, fallbackMessage) {
  const direct =
    error?.reason ||
    error?.revert?.args?.toString?.() ||
    error?.data?.message ||
    error?.error?.message ||
    error?.info?.error?.message;

  if (direct) return String(direct);

  const short = String(error?.shortMessage || "");
  if (short.includes("missing revert data")) {
    return (
      `${fallbackMessage}: MetaMask reported \"missing revert data\". ` +
      "This usually means MetaMask is pointed at the wrong network/RPC, the contract address does not exist on that chain, or the node did not return revert details. " +
      "Fix checklist: MetaMask network must be Ganache RPC http://127.0.0.1:7545 with the same chain id as Ganache, `CONTRACT_ADDRESS` must match your deployed contract, and your wallet must satisfy RBAC (Manufacturer for create; Distributor/Retailer for addStep; Admin for assignRole)."
    );
  }

  return String(error?.message || fallbackMessage);
}
