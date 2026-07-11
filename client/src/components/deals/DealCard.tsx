import React from "react";
import { DollarSign, Calendar, User } from "lucide-react";
import { format } from "date-fns";

export default function DealCard({ deal, onClick }) {
  return (
    <div
      onClick={() => onClick?.(deal)}
      className="bg-white rounded-lg border border-slate-200 p-3.5 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group"
    >
      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
        {deal.title}
      </p>
      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
        <User className="w-3 h-3" />
        <span className="truncate">{deal.contact_name}</span>
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
          <DollarSign className="w-3.5 h-3.5 text-green-500" />
          {(deal.value || 0).toLocaleString()}
        </div>
        {deal.expected_close_date && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3" />
            {format(new Date(deal.expected_close_date), "MMM d")}
          </div>
        )}
      </div>
      <div className="mt-2.5">
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all"
            style={{ width: `${deal.probability || 0}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">{deal.probability || 0}% probability</p>
      </div>
    </div>
  );
}