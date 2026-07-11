import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Handshake,
  Contact2,
  FileText,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Leads", path: "/leads", icon: Users },
  { label: "Deals", path: "/deals", icon: Handshake },
  { label: "Contacts", path: "/contacts", icon: Contact2 },
  { label: "Invoices", path: "/invoices", icon: FileText },
];

const adminItems = [
  { label: "Automation", path: "/settings/automation", icon: Zap },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ collapsed, onToggle, userRole }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
      style={{ background: "hsl(222 47% 11%)" }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <Handshake className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-white font-semibold text-lg tracking-tight truncate">
              CRM Pro
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        <p className={`text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 ${collapsed ? "text-center" : "px-2.5"}`}>
          {collapsed ? "•" : "Main"}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {userRole === "admin" && (
          <>
            <p className={`text-xs font-medium text-slate-400 uppercase tracking-wider mt-6 mb-2 ${collapsed ? "text-center" : "px-2.5"}`}>
              {collapsed ? "•" : "Admin"}
            </p>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    active
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}