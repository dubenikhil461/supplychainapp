/**
 * filename: frontend/src/components/FraudReport.jsx
 * purpose: Runs and displays AI fraud analysis for product history.
 * setup notes: Calls backend endpoint /api/fraud/analyse-product.
 */
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function riskColor(score) {
  if (score < 30) return "text-emerald-400";
  if (score < 60) return "text-amber-300";
  if (score < 80) return "text-orange-400";
  return "text-rose-400";
}

function severityBadge(severity) {
  const text = (severity || "").toLowerCase();
  if (text.includes("high") || text.includes("critical")) return "bg-red-500/20 text-red-200 ring-1 ring-red-500/40";
  if (text.includes("medium")) return "bg-amber-500/20 text-amber-100 ring-1 ring-amber-500/40";
  return "bg-sky-500/20 text-sky-100 ring-1 ring-sky-500/40";
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
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl shadow-black/30 backdrop-blur-md sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">Integrity</p>
          <h2 className="mt-1 text-xl font-bold text-white">AI fraud analysis</h2>
          <p className="mt-1 text-sm text-slate-400">Scores history patterns against typical supply-chain behavior.</p>
        </div>
        <button
          className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-60"
          disabled={loading}
          onClick={runFraudCheck}
          type="button"
        >
          Run analysis
        </button>
      </div>

      {loading ? (
        <div className="mt-5 flex items-center gap-3 text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          Analysing on-chain trail…
        </div>
      ) : null}

      {report ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className={`text-5xl font-bold tabular-nums ${riskColor(report.riskScore)}`}>{report.riskScore}</p>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-slate-100 ring-1 ring-white/15">
              {report.riskLevel}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-500">Risk score</p>

          {report.flags?.length ? (
            <div className="mt-5 space-y-3">
              {report.flags.map((flag, index) => (
                <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4" key={`${flag.issue}-${index}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-100">{flag.issue}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityBadge(flag.severity)}`}>
                      {flag.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{flag.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-emerald-200">
              No suspicious activity detected for this trail.
            </p>
          )}

          <p className="mt-5 text-sm leading-relaxed text-slate-300">{report.summary}</p>
        </div>
      ) : null}
    </div>
  );
}

export default FraudReport;
