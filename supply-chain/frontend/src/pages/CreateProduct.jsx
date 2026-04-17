/**
 * filename: frontend/src/pages/CreateProduct.jsx
 * purpose: Form for creating a product and showing generated QR code.
 * setup notes: Creates on-chain via MetaMask signer; QR generated via /api/product-qr.
 */
import React from "react";
import { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { ABI, CONTRACT_ADDRESS } from "../contractConfig";
import { formatEthersError } from "../utils/ethersError";

function CreateProduct() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            min="1"
            onChange={(event) => setId(event.target.value)}
            required
            type="number"
            value={id}
          />
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
        <div className="mt-6 rounded-md border border-slate-200 p-4">
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
      ) : null}
    </div>
  );
}

export default CreateProduct;
