import type { DashboardConfigMap, DashboardRole } from "../types/dashboard.types";

/** Analytics-only layouts. Daily work and shortcuts live on the Home page. */
export const ROLE_DASHBOARD_CONFIG: DashboardConfigMap = {
  ADMIN: [
    {
      id: "admin-org-kpis",
      type: "kpi_grid",
      title: "Organization Health & Executive Metrics",
      subtitle: "High-level aggregate metrics across teams and revenue streams",
      colSpan: 12,
      props: { scope: "org", metricsLayout: "5-cols" },
    },
    {
      id: "admin-revenue-chart",
      type: "revenue_chart",
      title: "Annual Revenue vs Target",
      subtitle: "Monthly revenue, closed ARR, and projections",
      colSpan: 7,
      props: { scope: "org", defaultTimeframe: "12M", showTargetLine: true },
    },
    {
      id: "admin-pipeline-funnel",
      type: "pipeline_funnel",
      title: "Team Pipeline Stage Velocity",
      subtitle: "Conversion rates and deal volume at each stage",
      colSpan: 5,
      props: { scope: "team" },
    },
    {
      id: "admin-team-leaderboard",
      type: "leaderboard",
      title: "Team & Rep Performance Rankings",
      subtitle: "Quota attainment, revenue, and win-loss ratios",
      colSpan: 12,
      props: { scope: "org", showQuota: true },
    },
  ],

  MANAGER: [
    {
      id: "manager-team-kpis",
      type: "kpi_grid",
      title: "Team Pipeline & Quota Overview",
      subtitle: "Quota pacing, average sales cycle, and active deals",
      colSpan: 12,
      props: { scope: "team", metricsLayout: "4-cols" },
    },
    {
      id: "manager-pipeline-funnel",
      type: "pipeline_funnel",
      title: "Team Pipeline Stage Velocity",
      subtitle: "Conversion rates and deal volume at each stage",
      colSpan: 7,
      props: { scope: "team" },
    },
    {
      id: "manager-rep-leaderboard",
      type: "leaderboard",
      title: "Sales Rep Quota Attainment",
      subtitle: "Direct reports ranked against quarterly quota",
      colSpan: 5,
      props: { scope: "team", showQuota: true },
    },
  ],

  SALES_REP: [
    {
      id: "rep-own-kpis",
      type: "kpi_grid",
      title: "My Performance & Pipeline",
      subtitle: "Personal quota progress, won revenue, and active opportunities",
      colSpan: 12,
      props: { scope: "own", metricsLayout: "4-cols" },
    },
    {
      id: "rep-pipeline-funnel",
      type: "pipeline_funnel",
      title: "My Deal Pipeline",
      subtitle: "Opportunities by stage and expected close date",
      colSpan: 12,
      props: { scope: "own" },
    },
  ],

  FINANCE: [
    {
      id: "finance-ar-kpis",
      type: "kpi_grid",
      title: "Accounts Receivable & Billing Metrics",
      subtitle: "Cash collected, outstanding AR, invoice aging, and DSO",
      colSpan: 12,
      props: { scope: "org", metricsLayout: "4-cols" },
    },
    {
      id: "finance-revenue-chart",
      type: "revenue_chart",
      title: "Invoiced vs Cash Collected",
      subtitle: "Billing trends and cash flow realization",
      colSpan: 12,
      props: { scope: "org", defaultTimeframe: "12M", mode: "cashflow" },
    },
  ],
};

export function normalizeRole(role?: string | null): DashboardRole {
  if (!role) return "ADMIN";
  const value = role.toUpperCase();
  if (value.includes("ADMIN") || value.includes("OWNER")) return "ADMIN";
  if (value.includes("MANAGER") || value.includes("LEAD")) return "MANAGER";
  if (value.includes("FINANCE") || value.includes("BILLING") || value.includes("ACCOUNTANT")) return "FINANCE";
  if (value.includes("REP") || value.includes("SALES") || value.includes("MEMBER")) return "SALES_REP";
  return "ADMIN";
}

export const ROLE_LABELS: Record<DashboardRole, { label: string; badge: string; description: string }> = {
  ADMIN: {
    label: "Executive / Admin",
    badge: "Admin View",
    description: "Full workspace visibility, executive KPIs, and audit telemetry",
  },
  MANAGER: {
    label: "Sales Manager",
    badge: "Team View",
    description: "Team quota attainment, rep pipelines, and approval queue",
  },
  SALES_REP: {
    label: "Sales Representative",
    badge: "Rep View",
    description: "Personal tasks, assigned leads, and my pipeline velocity",
  },
  FINANCE: {
    label: "Finance & Billing",
    badge: "Finance View",
    description: "Accounts receivable, invoice aging, and cash collections",
  },
};
