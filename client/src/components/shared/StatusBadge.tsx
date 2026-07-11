import React from "react";

const statusStyles = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-amber-50 text-amber-700 border-amber-200",
  Qualified: "bg-green-50 text-green-700 border-green-200",
  Unqualified: "bg-slate-50 text-slate-600 border-slate-200",
  Converted: "bg-purple-50 text-purple-700 border-purple-200",
  Qualification: "bg-blue-50 text-blue-700 border-blue-200",
  Proposal: "bg-amber-50 text-amber-700 border-amber-200",
  Negotiation: "bg-orange-50 text-orange-700 border-orange-200",
  "Closed Won": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Closed Lost": "bg-red-50 text-red-700 border-red-200",
  Draft: "bg-slate-50 text-slate-600 border-slate-200",
  Sent: "bg-blue-50 text-blue-700 border-blue-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Overdue: "bg-red-50 text-red-700 border-red-200",
  Cancelled: "bg-slate-50 text-slate-500 border-slate-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
}