/**
 * filename: frontend/src/components/Timeline.jsx
 * purpose: Visual timeline for product movement history.
 * setup notes: Expects `steps` with location, status, timestamp, updatedBy.
 */
import React from "react";

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getDotColor(status) {
  if (status === "Delivered") return "bg-emerald-500";
  if (status === "In Transit") return "bg-blue-500";
  return "bg-orange-400";
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function Timeline({ steps }) {
  if (!steps || steps.length === 0) {
    return (
      <div className="rounded-lg bg-white p-4 text-slate-600 shadow">
        No tracking steps available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div className="relative rounded-lg bg-white p-4 shadow" key={`${step.timestamp}-${index}`}>
          <div className="absolute left-4 top-4 h-full border-l-2 border-slate-200" />
          <div className="relative ml-8">
            <span className={`absolute -left-10 top-1 h-4 w-4 rounded-full ${getDotColor(step.status)}`} />
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {step.status}
              </span>
              <span className="text-sm text-slate-500">{step.location}</span>
            </div>
            <p className="text-sm text-slate-700">{formatDate(step.timestamp)}</p>
            <p className="mt-1 text-xs text-slate-500">Updated by: {truncateAddress(step.updatedBy)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
