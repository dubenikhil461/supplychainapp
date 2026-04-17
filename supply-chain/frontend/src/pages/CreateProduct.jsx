/**
 * filename: frontend/src/pages/CreateProduct.jsx
 * purpose: Form for creating a product and showing generated QR code.
 * setup notes: Creates on-chain via MetaMask signer; QR generated via /api/product-qr. Next free ID from /api/next-product-id.
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { ABI, CONTRACT_ADDRESS } from "../contractConfig";
import { formatEthersError } from "../utils/ethersError";

const LAST_PRODUCT_ID_KEY = "supplychain:lastProductId";

function CreateProduct() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestingId, setSuggestingId] = useState(false);

  const loadSuggestedId = async () => {
    try {
      setSuggestingId(true);
      const { data } = await axios.get("/api/next-product-id");
      if (data?.success && data.nextId != null) {
        setId(String(data.nextId));
      }
    } catch {
      toast.error("Could not load next free ID. Is the backend running?");
    } finally {
      setSuggestingId(false);
    }
  };

  useEffect(() => {
    loadSuggestedId();
  }, []);

  const downloadQr = async () => {
    try {
      if (!qrCode) return;
      const link = document.createElement("a");
      link.href = qrCode;
      link.download = `product-${id}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error(`Failed to download QR: ${error.message}`);
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(String(id));
      toast.success("Product ID copied");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

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

      const tx = await contract.createProduct(BigInt(id), name);
      await tx.wait();

      localStorage.setItem(LAST_PRODUCT_ID_KEY, String(id));

      const qrResponse = await axios.post("/api/product-qr", { id: Number(id) });
      setQrCode(qrResponse.data.qrCode);
      toast.success(`Product created. Tx: ${tx.hash}`);
    } catch (error) {
      toast.error(formatEthersError(error, "Failed to create product"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/90">On-chain issuance</p>
        <h1 className="relative mt-2 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Mint a product and ship a verification-ready QR in one flow.
        </h1>
        <p className="relative mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
          IDs are suggested from the contract. Connect your wallet, confirm the transaction, and download a shareable code
          for your supply line.
        </p>
      </header>

      <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl shadow-black/30 backdrop-blur-md sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-40 [background-size:200%_200%] [background-image:linear-gradient(115deg,transparent,rgba(34,211,238,0.12),transparent,rgba(139,92,246,0.08),transparent)] animate-gradient-shift"
        />
        <div className="relative">
          <h2 className="mb-6 text-lg font-semibold text-white">New product</h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Product ID</label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-cyan-100 shadow-inner shadow-black/40 placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 sm:max-w-xs"
                  min="1"
                  onChange={(event) => setId(event.target.value)}
                  placeholder="e.g. 42"
                  required
                  type="number"
                  value={id}
                />
                <button
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 shadow-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={suggestingId}
                  onClick={() => loadSuggestedId()}
                  type="button"
                >
                  {suggestingId ? "Loading…" : "Use next free ID"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                The next unused ID on the contract is prefilled. Change it only when you need a specific number.
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Product name</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 shadow-inner shadow-black/40 placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Organic cocoa batch A12"
                required
                type="text"
                value={name}
              />
            </div>
            <button
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-5 py-3.5 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:from-cyan-300 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              ) : null}
              {isLoading ? "Creating…" : "Create on-chain"}
            </button>
          </form>

          {qrCode ? (
            <div className="mt-8 space-y-5 border-t border-white/10 pt-8">
              <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 to-slate-950/40 p-5 text-slate-100">
                <p className="text-lg font-semibold text-white">Product #{id} is live</p>
                <p className="mt-1 text-sm text-slate-400">
                  This ID is remembered for updates. Copy it or jump straight to the handoff flow.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                    onClick={copyId}
                    type="button"
                  >
                    Copy ID
                  </button>
                  <Link
                    className="inline-flex items-center rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400"
                    to={`/update?productId=${encodeURIComponent(id)}`}
                  >
                    Open update
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <p className="mb-4 text-sm font-medium text-slate-400">QR code</p>
                <div className="inline-block rounded-2xl border border-white/10 bg-white p-4 shadow-2xl shadow-black/50">
                  <img alt="Product QR Code" className="h-52 w-52 object-contain" src={qrCode} />
                </div>
                <button
                  className="mt-4 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white"
                  onClick={downloadQr}
                  type="button"
                >
                  Download PNG
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CreateProduct;
