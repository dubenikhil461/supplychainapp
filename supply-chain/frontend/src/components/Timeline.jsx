/**
 * filename: frontend/src/components/Timeline.jsx
 * purpose: Animated vertical timeline for product history.
 * setup notes: Expects step objects with status, location, timestamp, updatedBy.
 */
import React from "react";

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function borderColor(status) {
  if (status === "Delivered") return "border-l-4 border-emerald-500";
  if (status === "In Transit" || status === "Shipped") return "border-l-4 border-blue-500";
  if (status === "Out for Delivery") return "border-l-4 border-orange-500";
  return "border-l-4 border-slate-300";
}

function statusIcon(status) {
  if (status === "Created") return "🏭";
  if (status === "Manufactured") return "⚙️";
  if (status === "Quality Check") return "🔬";
  if (status === "Shipped") return "📦";
  if (status === "In Transit") return "🚚";
  if (status === "At Warehouse") return "🏪";
  if (status === "Out for Delivery") return "🛵";
  if (status === "Delivered") return "✅";
  return "📌";
}

function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} at ${hour}:${minute}`;
}

function Timeline({ steps }) {
  if (!steps || steps.length === 0) {
    return (
      <div className="rounded-lg bg-white p-4 text-slate-600 shadow">
        No tracking steps available.
      </div>
    );
  }

  const firstSeen = formatDateTime(steps[0].timestamp);
  const lastStep = steps[steps.length - 1];
  const lastUpdated = formatDateTime(lastStep.timestamp);

  return (
    <div>
      <style>
        {`
          @keyframes timelineFadeSlide {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div className="mb-4 rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
        <p className="font-semibold">
          Total Steps: {steps.length} | First Seen: {firstSeen} | Last Updated: {lastUpdated} | Current Status:{" "}
          {lastStep.status}
        </p>
      </div>
      <div className="relative space-y-4 pl-6">
        <div className="absolute left-2 top-0 h-full border-l-2 border-slate-300" />
        {steps.map((step, index) => (
          <div
            className={`relative rounded-lg bg-white p-4 shadow ${borderColor(step.status)}`}
            key={`${step.timestamp}-${index}`}
            style={{ animation: "timelineFadeSlide 360ms ease-out forwards", animationDelay: `${index * 100}ms`, opacity: 0 }}
          >
            <span className="absolute -left-7 top-5 text-lg">●</span>
            {index === steps.length - 1 ? (
              <span className="absolute right-3 top-3 rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700">
                LATEST
              </span>
            ) : null}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{statusIcon(step.status)}</span>
              <h3 className="text-lg font-bold text-slate-800">{step.status}</h3>
            </div>
            <p className="mt-2 text-sm text-slate-700">📍 {step.location}</p>
            <p className="mt-1 text-xs text-slate-500">Updated by {truncateAddress(step.updatedBy)}</p>
            <p className="mt-1 text-xs text-slate-500">{formatDateTime(step.timestamp)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
