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
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 text-slate-300">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          Loading product details…
        </div>
      </div>
    );
  }

  const validLocationSteps = history.filter((step) => step.location && step.location.trim().length > 1);

  return (
    <div className="space-y-6">
      {id === "scan" ? (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Verify</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Scan product QR</h1>
          <p className="mt-2 text-sm text-slate-400">Point your camera at a code to open its live tracking page.</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-6 text-red-100 shadow-xl backdrop-blur-md">{error}</div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl shadow-black/30 backdrop-blur-md sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Trace</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Product details</h1>
          <div className="mt-6 grid gap-3 rounded-xl border border-white/5 bg-slate-950/50 p-5 font-mono text-sm text-slate-300 sm:grid-cols-2">
            <p>
              <span className="block text-xs font-sans font-medium uppercase tracking-wider text-slate-500">Name</span>
              {product?.name}
            </p>
            <p>
              <span className="block text-xs font-sans font-medium uppercase tracking-wider text-slate-500">ID</span>
              {product?.id}
            </p>
            <p className="sm:col-span-2">
              <span className="block text-xs font-sans font-medium uppercase tracking-wider text-slate-500">Current owner</span>
              {truncateAddress(product?.currentOwner)}
            </p>
          </div>
          <button
            className="mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-violet-400"
            onClick={() => window.open(`/api/certificate/certificate/${id}`, "_blank")}
            type="button"
          >
            Download certificate
          </button>
          {validLocationSteps.length >= 2 ? (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-white">Journey map</h2>
              {mapLoading ? <p className="mb-2 text-sm text-slate-500">Loading map…</p> : null}
              <JourneyMap onLoadingChange={setMapLoading} steps={history} />
            </div>
          ) : null}
          <div className="mt-8">
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
