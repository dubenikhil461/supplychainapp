/**
 * filename: frontend/src/pages/ViewProduct.jsx
 * purpose: Product details page with full timeline and QR scanner.
 * setup notes: Reads product id from URL and fetches /api/product/:id.
 */
import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Timeline from "../components/Timeline";
import QRScanner from "../components/QRScanner";
import JourneyMap from "../components/JourneyMap";
import FraudReport from "../components/FraudReport";

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function ViewProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapLoading, setMapLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (id === "scan") {
          setLoading(false);
          return;
        }
        setLoading(true);
        const response = await axios.get(`/api/product/${id}`);
        setProduct(response.data.product);
        setHistory(response.data.history);
        setError("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="rounded-lg bg-white p-6 shadow">Loading product details...</div>;
  }

  const validLocationSteps = history.filter((step) => step.location && step.location.trim().length > 1);

  return (
    <div className="space-y-6">
      {id === "scan" ? (
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-slate-800">Scan Product QR</h1>
          <p className="mt-2 text-sm text-slate-600">
            Start scanning to open a product tracking page directly.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-6 text-red-700 shadow">{error}</div>
      ) : (
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-slate-800">Product Details</h1>
          <div className="mt-4 grid gap-2 text-slate-700">
            <p>
              <span className="font-semibold">Product Name:</span> {product?.name}
            </p>
            <p>
              <span className="font-semibold">Product ID:</span> {product?.id}
            </p>
            <p>
              <span className="font-semibold">Current Owner:</span> {truncateAddress(product?.currentOwner)}
            </p>
          </div>
          <button
            className="mt-5 rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
            onClick={() => window.open(`/api/certificate/certificate/${id}`, "_blank")}
            type="button"
          >
            📥 Download Certificate
          </button>
          {validLocationSteps.length >= 2 ? (
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold text-slate-800">Live Product Journey Map</h2>
              {mapLoading ? <p className="mb-2 text-sm text-slate-600">Loading map...</p> : null}
              <JourneyMap onLoadingChange={setMapLoading} steps={history} />
            </div>
          ) : null}
          <div className="mt-6">
            <Timeline steps={history} />
          </div>
        </div>
      )}
      <QRScanner />
      {id !== "scan" && !error ? <FraudReport productId={id} /> : null}
    </div>
  );
}

export default ViewProduct;
