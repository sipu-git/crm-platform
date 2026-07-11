import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Users,
  Handshake,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDistanceToNow } from "date-fns";

function StatCard({ icon: Icon, label, value, trend, trendUp, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trendUp ? "text-green-600" : "text-red-500"}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ leads: 0, deals: 0, invoices: 0, revenue: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [leads, deals, invoices] = await Promise.all([
          base44.entities.Lead.list("-created_date", 50),
          base44.entities.Deal.list("-created_date", 50),
          base44.entities.Invoice.list("-created_date", 50),
        ]);
        const revenue = deals
          .filter(d => d.stage === "Closed Won")
          .reduce((sum, d) => sum + (d.value || 0), 0);
        setStats({
          leads: leads.length,
          deals: deals.length,
          invoices: invoices.length,
          revenue,
        });
        setRecentLeads(leads.slice(0, 5));
        setRecentDeals(deals.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white rounded-xl border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your CRM performance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Leads"
          value={stats.leads}
          trend="+12%"
          trendUp
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Handshake}
          label="Active Deals"
          value={stats.deals}
          trend="+8%"
          trendUp
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={FileText}
          label="Invoices"
          value={stats.invoices}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue (Won)"
          value={`$${stats.revenue.toLocaleString()}`}
          trend="+23%"
          trendUp
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="text-sm font-semibold text-slate-800">Recent Leads</h3>
            <Link to="/leads" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No leads yet</p>
            ) : (
              recentLeads.map(lead => (
                <div key={lead.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-semibold flex-shrink-0">
                      {lead.first_name?.[0]}{lead.last_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {lead.first_name} {lead.last_name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{lead.company || lead.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Deals */}
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="text-sm font-semibold text-slate-800">Recent Deals</h3>
            <Link to="/deals" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {recentDeals.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No deals yet</p>
            ) : (
              recentDeals.map(deal => (
                <div key={deal.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{deal.title}</p>
                    <p className="text-xs text-slate-400">{deal.contact_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">${(deal.value || 0).toLocaleString()}</span>
                    <StatusBadge status={deal.stage} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}