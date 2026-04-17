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
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Handoff</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Update product status</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          Record location and stage on-chain so buyers and auditors can trust the trail.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl shadow-black/30 backdrop-blur-md sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Product ID</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-cyan-100 shadow-inner shadow-black/40 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              min="1"
              onChange={(event) => setProductId(event.target.value)}
              required
              type="number"
              value={productId}
            />
            <p className="mt-2 text-xs text-slate-500">
              Filled from <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-slate-300">/update?productId=…</code>{" "}
              or your last created product in this browser.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Location</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              onChange={(event) => setLocation(event.target.value)}
              placeholder="City, facility, or coordinates"
              required
              type="text"
              value={location}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Status</label>
            <select
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} className="bg-slate-900" value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <button
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-5 py-3.5 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            ) : null}
            {isLoading ? "Updating…" : "Add step on-chain"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProduct;
