import type { DashboardConfigMap, DashboardRole } from "./dashboard.types";

export const ROLE_DASHBOARD_CONFIG: DashboardConfigMap = {
  ADMIN: [
    {
      id: "admin-org-kpis",
      type: "kpi_grid",
      title: "Organization Health & Executive Metrics",
      subtitle: "High-level aggregate metrics across all active teams and revenue streams",
      colSpan: 12,
      props: {
        scope: "org",
        metricsLayout: "5-cols",
      },
    },
    {
      id: "admin-revenue-chart",
      type: "revenue_chart",
      title: "Annual Revenue vs Target",
      subtitle: "Monthly recurring revenue, closed ARR, and projection models",
      colSpan: 7,
      props: {
        scope: "org",
        defaultTimeframe: "12M",
        showTargetLine: true,
      },
    },
    {
      id: "admin-pipeline-funnel",
      type: "pipeline_funnel",
      title: "Team Pipeline Stage Velocity",
      subtitle: "Conversion rates and deal volume across each deal stage",
      colSpan: 5,
      props: {
        scope: "team",
      },
    },
    {
      id: "admin-team-leaderboard",
      type: "leaderboard",
      title: "Team & Rep Performance Rankings",
      subtitle: "Quota attainment, revenue generated, and win-loss ratios",
      colSpan: 7,
      props: {
        scope: "org",
        showQuota: true,
      },
    },
    {
      id: "admin-calendar-upcoming",
      type: "calendar_upcoming",
      title: "Upcoming Meetings",
      subtitle: "Scheduled Google Calendar meetings & video calls",
      colSpan: 5,
      props: {
        scope: "org",
      },
    },
    {
      id: "admin-alerts",
      type: "alerts",
      title: "System & Compliance Alerts",
      subtitle: "Urgent items, security audits, and high-value deal risks",
      colSpan: 4,
      props: {
        scope: "org",
        maxItems: 4,
      },
    },
    {
      id: "admin-quick-actions",
      type: "quick_actions",
      title: "Admin Quick Commands",
      subtitle: "Administrative shortcuts for workspace, billing, and team management",
      colSpan: 8,
      props: {
        scope: "org",
      },
    },
  ],

  // ==========================================
  // 2. MANAGER DASHBOARD CONFIGURATION
  // ==========================================
  MANAGER: [
    {
      id: "manager-team-kpis",
      type: "kpi_grid",
      title: "Team Pipeline & Quota Overview",
      subtitle: "Current period quota pacing, average sales cycle, and active deals",
      colSpan: 12,
      props: {
        scope: "team",
        metricsLayout: "4-cols",
      },
    },
    {
      id: "manager-pipeline-funnel",
      type: "pipeline_funnel",
      title: "Team Pipeline Stage Velocity",
      subtitle: "Conversion rates and deal volume across each deal stage",
      colSpan: 7,
      props: {
        scope: "team",
      },
    },
    {
      id: "manager-task-queue",
      type: "task_queue",
      title: "Team Approval & Follow-up Queue",
      subtitle: "Discount approval requests, stuck deal reviews, and SLA warnings",
      colSpan: 5,
      props: {
        scope: "team",
        showAssignee: true,
      },
    },
    {
      id: "manager-rep-leaderboard",
      type: "leaderboard",
      title: "Sales Rep Quota Attainment",
      subtitle: "Performance ranking of direct reports against quarterly quota",
      colSpan: 7,
      props: {
        scope: "team",
        showQuota: true,
      },
    },
    {
      id: "manager-activity-feed",
      type: "activity_feed",
      title: "Team Activity Stream",
      subtitle: "Recent calls, emails, and meetings logged by sales reps",
      colSpan: 5,
      props: {
        scope: "team",
        limit: 8,
      },
    },
    {
      id: "manager-quick-actions",
      type: "quick_actions",
      title: "Team Management Actions",
      subtitle: "Reassign leads, broadcast goals, and schedule team reviews",
      colSpan: 12,
      props: {
        scope: "team",
      },
    },
  ],

  // ==========================================
  // 3. SALES REP DASHBOARD CONFIGURATION
  // ==========================================
  SALES_REP: [
    {
      id: "rep-own-kpis",
      type: "kpi_grid",
      title: "My Performance & Pipeline",
      subtitle: "Personal quota progress, won revenue, and active opportunities",
      colSpan: 12,
      props: {
        scope: "own",
        metricsLayout: "4-cols",
      },
    },
    {
      id: "rep-task-queue",
      type: "task_queue",
      title: "Today's Action Items & Follow-ups",
      subtitle: "High priority calls, meetings, and follow-ups due today",
      colSpan: 7,
      props: {
        scope: "own",
        highlightUrgent: true,
      },
    },
    {
      id: "rep-pipeline-funnel",
      type: "pipeline_funnel",
      title: "My Deal Pipeline",
      subtitle: "Opportunities by stage and expected close dates",
      colSpan: 5,
      props: {
        scope: "own",
      },
    },
    {
      id: "rep-activity-feed",
      type: "activity_feed",
      title: "My Activity Log",
      subtitle: "Your recently logged customer interactions and notes",
      colSpan: 7,
      props: {
        scope: "own",
        limit: 6,
      },
    },
    {
      id: "rep-new-leads",
      type: "new_leads",
      title: "Assigned Inbound Leads",
      subtitle: "Recent prospective accounts waiting for initial outreach",
      colSpan: 5,
      props: {
        scope: "own",
        limit: 5,
      },
    },
    {
      id: "rep-calendar-upcoming",
      type: "calendar_upcoming",
      title: "Upcoming Meetings",
      subtitle: "Your scheduled meetings & Google Meet calls",
      colSpan: 5,
      props: {
        scope: "own",
      },
    },
    {
      id: "rep-quick-actions",
      type: "quick_actions",
      title: "Quick Actions",
      subtitle: "Log interactions, create opportunities, and add new contacts",
      colSpan: 12,
      props: {
        scope: "own",
      },
    },
  ],

  // ==========================================
  // 4. FINANCE DASHBOARD CONFIGURATION
  // ==========================================
  FINANCE: [
    {
      id: "finance-ar-kpis",
      type: "kpi_grid",
      title: "Accounts Receivable & Billing Metrics",
      subtitle: "Cash collected MTD, outstanding AR, overdue balances, and DSO",
      colSpan: 12,
      props: {
        scope: "org",
        metricsLayout: "4-cols",
      },
    },
    {
      id: "finance-revenue-chart",
      type: "revenue_chart",
      title: "Invoiced vs Cash Collected",
      subtitle: "Cash flow realization and billing trends across previous periods",
      colSpan: 7,
      props: {
        scope: "org",
        defaultTimeframe: "12M",
        mode: "cashflow",
      },
    },
    {
      id: "finance-alerts",
      type: "alerts",
      title: "Overdue & High Risk Invoices",
      subtitle: "Invoices overdue >30 days needing immediate collection escalation",
      colSpan: 5,
      props: {
        scope: "org",
        category: "billing",
        maxItems: 4,
      },
    },
    {
      id: "finance-invoices-table",
      type: "invoices_table",
      title: "Pending & Overdue Invoices Ledger",
      subtitle: "Recent billing statements, payment terms, and status",
      colSpan: 8,
      props: {
        scope: "org",
        filter: "unpaid",
        limit: 6,
      },
    },
    {
      id: "finance-quick-actions",
      type: "quick_actions",
      title: "Financial Operations",
      subtitle: "Issue invoices, record manual payments, and export tax statements",
      colSpan: 4,
      props: {
        scope: "org",
      },
    },
  ],
};

export function normalizeRole(role?: string | null): DashboardRole {
  if (!role) return "ADMIN";
  const r = role.toUpperCase();
  if (r.includes("ADMIN") || r.includes("OWNER")) return "ADMIN";
  if (r.includes("MANAGER") || r.includes("LEAD")) return "MANAGER";
  if (r.includes("FINANCE") || r.includes("BILLING") || r.includes("ACCOUNTANT")) return "FINANCE";
  if (r.includes("REP") || r.includes("SALES") || r.includes("MEMBER")) return "SALES_REP";
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
