/**
 * filename: frontend/src/pages/UpdateProduct.jsx
 * purpose: Form to append supply-chain status updates to product history.
 * setup notes: Calls backend endpoint /api/add-step.
 */
import React from "react";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
  const [productId, setProductId] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post("/api/add-step", {
        productId: Number(productId),
        location,
        status
      });
      toast.success(`Step added. Tx: ${response.data.txHash}`);
      setLocation("");
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to add step";
      toast.error(message);
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
