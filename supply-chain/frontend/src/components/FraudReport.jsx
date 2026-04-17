/**
 * filename: frontend/src/components/FraudReport.jsx
 * purpose: Runs and displays AI fraud analysis for product history.
 * setup notes: Calls backend endpoint /api/fraud/analyse-product.
 */
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function riskColor(score) {
  if (score < 30) return "text-emerald-600";
  if (score < 60) return "text-yellow-600";
  if (score < 80) return "text-red-600";
  return "text-rose-700";
}

function severityBadge(severity) {
  const text = (severity || "").toLowerCase();
  if (text.includes("high") || text.includes("critical")) return "bg-red-100 text-red-700";
  if (text.includes("medium")) return "bg-yellow-100 text-yellow-700";
  return "bg-blue-100 text-blue-700";
}

function FraudReport({ productId }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const runFraudCheck = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/fraud/analyse-product", { productId: Number(productId) });
      const payload = response.data;
      if (!payload?.success || !payload?.report) {
        toast.error(payload?.message || "Unexpected response from fraud API");
        return;
      }
      setReport(payload.report);
    } catch (error) {
      const data = error.response?.data;
      const detail = [data?.message, data?.cause].filter(Boolean).join(" — ");
      toast.error(detail || error.message || "Fraud check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <button
        className="rounded-md bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        disabled={loading}
        onClick={runFraudCheck}
        type="button"
      >
        🛡️ Run AI Fraud Check
      </button>

      {loading ? (
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          AI is analysing blockchain data...
        </div>
      ) : null}

      {report ? (
        <div className="mt-6 rounded-md border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className={`text-4xl font-bold ${riskColor(report.riskScore)}`}>{report.riskScore}</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
              {report.riskLevel}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Risk Score</p>

          {report.flags?.length ? (
            <div className="mt-4 space-y-3">
              {report.flags.map((flag, index) => (
                <div className="rounded-md border border-slate-200 p-3" key={`${flag.issue}-${index}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">{flag.issue}</p>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${severityBadge(flag.severity)}`}>
                      {flag.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{flag.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-md bg-emerald-50 p-3 text-emerald-700">✅ No suspicious activity detected</p>
          )}

          <p className="mt-4 text-sm text-slate-700">{report.summary}</p>
        </div>
      ) : null}
    </div>
  );
}

export default FraudReport;
