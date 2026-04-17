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
    <div className="rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">Create Product</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Product ID</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 sm:max-w-xs"
              min="1"
              onChange={(event) => setId(event.target.value)}
              required
              type="number"
              value={id}
            />
            <button
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-60"
              disabled={suggestingId}
              onClick={() => loadSuggestedId()}
              type="button"
            >
              {suggestingId ? "Loading…" : "Use next free ID"}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            The next unused ID on the contract is filled in for you. Change it only if you need a specific number.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Product Name</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onChange={(event) => setName(event.target.value)}
            required
            type="text"
            value={name}
          />
        </div>
        <button
          className="inline-flex items-center rounded-md bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-70"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" /> : null}
          {isLoading ? "Creating..." : "Create Product"}
        </button>
      </form>

      {qrCode ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-md border border-cyan-200 bg-cyan-50 p-4 text-slate-800">
            <p className="text-lg font-semibold">Product #{id} is on-chain</p>
            <p className="mt-1 text-sm text-slate-600">
              This ID is saved for the Update page. Copy it or open Update with the field already filled.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                onClick={copyId}
                type="button"
              >
                Copy product ID
              </button>
              <Link
                className="inline-flex items-center rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
                to={`/update?productId=${encodeURIComponent(id)}`}
              >
                Open Update Product
              </Link>
            </div>
          </div>
          <div className="rounded-md border border-slate-200 p-4">
            <p className="mb-2 text-sm text-slate-600">Generated QR Code:</p>
            <img alt="Product QR Code" className="h-52 w-52 rounded-md border border-slate-200 object-contain" src={qrCode} />
            <button
              className="mt-3 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              onClick={downloadQr}
              type="button"
            >
              Download QR
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CreateProduct;
