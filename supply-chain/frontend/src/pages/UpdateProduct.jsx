/**
 * filename: frontend/src/pages/UpdateProduct.jsx
 * purpose: Form to append supply-chain status updates to product history.
 * setup notes: Writes on-chain via MetaMask signer calling addStep. Prefills from ?productId= or last created ID in localStorage.
 */
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { ABI, CONTRACT_ADDRESS } from "../contractConfig";
import { formatEthersError } from "../utils/ethersError";

const LAST_PRODUCT_ID_KEY = "supplychain:lastProductId";

const STATUS_OPTIONS = [
  "Manufactured",
  "Quality Check",
  "Shipped",
  "In Transit",
  "At Warehouse",
  "Out for Delivery",
  "Delivered"
];

function UpdateProduct() {
  const [searchParams] = useSearchParams();
  const [productId, setProductId] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams.get("productId");
    if (fromQuery != null && String(fromQuery).trim() !== "") {
      setProductId(String(fromQuery).trim());
      return;
    }
    const stored = localStorage.getItem(LAST_PRODUCT_ID_KEY);
    if (stored) setProductId(stored);
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      if (!window.ethereum) {
        toast.error("MetaMask not found. Please install it first.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.addStep(BigInt(productId), location, status);
      await tx.wait();

      localStorage.setItem(LAST_PRODUCT_ID_KEY, String(productId));
      toast.success(`Step added. Tx: ${tx.hash}`);
      setLocation("");
    } catch (error) {
      toast.error(formatEthersError(error, "Failed to add step"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">Update Product Status</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Product ID</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            min="1"
            onChange={(event) => setProductId(event.target.value)}
            required
            type="number"
            value={productId}
          />
          <p className="mt-1 text-xs text-slate-500">
            Filled from <code className="text-slate-700">/update?productId=…</code> or your last created product on this browser.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onChange={(event) => setLocation(event.target.value)}
            required
            type="text"
            value={location}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <button
          className="rounded-md bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-70"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Updating..." : "Add Step"}
        </button>
      </form>
    </div>
  );
}

export default UpdateProduct;
