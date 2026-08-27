import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { fetchDeals, selectDeals, selectDealsLoading } from "@/features/deals/slice";
import { activitiesSelectors, fetchActivities } from "@/features/activities/slice";
import { viewLeads } from "@/features/leads/service1/slice";
import { fetchInvoices, selectInvoices, selectInvoicesLoading } from "@/features/invoices/service2/slice";
import { fetchUsers } from "@/features/users/slice";
import { format, startOfMonth, subMonths, isBefore, isToday, isTomorrow } from "date-fns";
import type {DashboardRole,WidgetScope,KpiMetric,FunnelStage,LeaderboardRep,TaskItem,AlertItem,RevenueDataPoint} from "./dashboard.types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function useDashboardData(role: DashboardRole) {
  const dispatch = useDispatch<AppDispatch>();

  const deals = useSelector(selectDeals) ?? [];
  const dealsLoading = useSelector(selectDealsLoading);

  const activities = useSelector(activitiesSelectors.selectAll) ?? [];

  const leads = useSelector((s: RootState) => s.leads?.leads ?? []);
  const leadsLoading = useSelector((s: RootState) => s.leads?.loading);

  const invoices = useSelector(selectInvoices) ?? [];
  const invoicesLoading = useSelector(selectInvoicesLoading);

  // Correctly access users from users slice via items (TeamUser[])
  const users = useSelector((s: RootState) => s.users?.items ?? []);
  const usersLoading = useSelector((s: RootState) => s.users?.status === "loading");
  const currentUser = useSelector((s: RootState) => s.auth?.user);

  const isLoading = dealsLoading || leadsLoading || invoicesLoading || usersLoading;

  useEffect(() => {
    dispatch(fetchDeals());
    dispatch(viewLeads());
    dispatch(fetchActivities({}));
    dispatch(fetchInvoices({}));
    dispatch(fetchUsers());
  }, [dispatch]);

  // ==========================================
  // 1. DYNAMIC KPI METRICS COMPUTATION
  // ==========================================
  const kpiMetrics = useMemo<Record<DashboardRole, KpiMetric[]>>(() => {
    const openDeals = deals.filter((d) => !d.pipeline?.is_won && !d.pipeline?.is_lost);
    const wonDeals = deals.filter((d) => d.pipeline?.is_won);
    const totalPipelineVal = openDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const closedRevenueVal = wonDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const totalDealsCount = deals.length;
    const winRateVal = totalDealsCount > 0 ? Math.round((wonDeals.length / totalDealsCount) * 100) : 0;

    const now = new Date();
    const paidInvoices = invoices.filter((i) => i.status === "PAID");
    const unpaidInvoices = invoices.filter((i) => i.status !== "PAID");
    const totalCollectedVal = paidInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
    const totalOutstandingARVal = unpaidInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
    const overdueInvoices = unpaidInvoices.filter(
      (i) => i.due_date && isBefore(new Date(i.due_date), now),
    );
    const totalOverdueVal = overdueInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);

    const mrrVal = Math.round(closedRevenueVal / 12);
    const activeLeadCount = leads.length;
    const activeTeamCount = users.length;

    // Rep personal metrics
    const myDeals = deals.filter(
      (d) => d.owner_id === currentUser?.id || (d as any).ownerId === currentUser?.id || (d as any).userId === currentUser?.id,
    );
    const myWonDeals = myDeals.filter((d) => d.pipeline?.is_won);
    const myOpenDeals = myDeals.filter((d) => !d.pipeline?.is_won && !d.pipeline?.is_lost);
    const myPipelineVal = myOpenDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const myClosedRevenue = myWonDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const myWinRate = myDeals.length > 0 ? Math.round((myWonDeals.length / myDeals.length) * 100) : winRateVal;

    return {
      // ADMIN METRICS
      ADMIN: [
        {
          id: "admin-arr",
          label: "Closed Revenue (ARR)",
          value: closedRevenueVal,
          formattedValue: formatCurrency(closedRevenueVal),
          changePeriod: `${wonDeals.length} won deals`,
          iconName: "DollarSign",
          scope: "org",
        },
        {
          id: "admin-mrr",
          label: "Monthly Run Rate (MRR)",
          value: mrrVal,
          formattedValue: formatCurrency(mrrVal),
          changePeriod: "estimated monthly",
          iconName: "TrendingUp",
          scope: "org",
        },
        {
          id: "admin-pipeline",
          label: "Total Open Pipeline",
          value: totalPipelineVal,
          formattedValue: formatCurrency(totalPipelineVal),
          changePeriod: `${openDeals.length} open deals`,
          iconName: "Layers",
          scope: "org",
        },
        {
          id: "admin-winrate",
          label: "Org Win Rate",
          value: `${winRateVal}%`,
          formattedValue: `${winRateVal}%`,
          changePeriod: `${wonDeals.length} of ${totalDealsCount} total deals`,
          iconName: "Target",
          scope: "org",
        },
        {
          id: "admin-team",
          label: "Workspace Members",
          value: activeTeamCount,
          formattedValue: `${activeTeamCount} Members`,
          changePeriod: "registered users",
          iconName: "Users",
          scope: "org",
        },
      ],

      // MANAGER METRICS
      MANAGER: [
        {
          id: "manager-pipeline",
          label: "Team Pipeline Value",
          value: totalPipelineVal,
          formattedValue: formatCurrency(totalPipelineVal),
          changePeriod: `${openDeals.length} active opportunities`,
          iconName: "TrendingUp",
          scope: "team",
        },
        {
          id: "manager-deals-closed",
          label: "Team Closed Revenue",
          value: closedRevenueVal,
          formattedValue: formatCurrency(closedRevenueVal),
          changePeriod: `${wonDeals.length} deals won`,
          iconName: "CheckCircle2",
          scope: "team",
        },
        {
          id: "manager-winrate",
          label: "Team Win Rate",
          value: `${winRateVal}%`,
          formattedValue: `${winRateVal}%`,
          changePeriod: `${totalDealsCount} total evaluated deals`,
          iconName: "Award",
          scope: "team",
        },
        {
          id: "manager-leads",
          label: "Active Inbound Leads",
          value: activeLeadCount,
          formattedValue: `${activeLeadCount} Leads`,
          changePeriod: "in pipeline",
          iconName: "Zap",
          scope: "team",
        },
      ],

      // SALES REP METRICS
      SALES_REP: [
        {
          id: "rep-pipeline",
          label: "My Open Pipeline",
          value: myPipelineVal,
          formattedValue: formatCurrency(myPipelineVal),
          changePeriod: `${myOpenDeals.length} active deals`,
          iconName: "Briefcase",
          scope: "own",
        },
        {
          id: "rep-revenue",
          label: "My Closed Revenue",
          value: myClosedRevenue,
          formattedValue: formatCurrency(myClosedRevenue),
          changePeriod: `${myWonDeals.length} won deals`,
          iconName: "Trophy",
          scope: "own",
        },
        {
          id: "rep-winrate",
          label: "My Win Rate",
          value: `${myWinRate}%`,
          formattedValue: `${myWinRate}%`,
          changePeriod: "won ratio",
          iconName: "Target",
          scope: "own",
        },
        {
          id: "rep-activities",
          label: "Activities Logged",
          value: activities.length,
          formattedValue: `${activities.length} Logged`,
          changePeriod: "calls, emails, meetings",
          iconName: "PhoneCall",
          scope: "own",
        },
      ],

      // FINANCE METRICS
      FINANCE: [
        {
          id: "finance-collected",
          label: "Cash Collected",
          value: totalCollectedVal,
          formattedValue: formatCurrency(totalCollectedVal),
          changePeriod: `${paidInvoices.length} paid invoices`,
          iconName: "DollarSign",
          scope: "org",
        },
        {
          id: "finance-ar",
          label: "Total Accounts Receivable",
          value: totalOutstandingARVal,
          formattedValue: formatCurrency(totalOutstandingARVal),
          changePeriod: `${unpaidInvoices.length} unpaid invoices`,
          iconName: "CreditCard",
          scope: "org",
        },
        {
          id: "finance-overdue",
          label: "Overdue Invoices",
          value: totalOverdueVal,
          formattedValue: formatCurrency(totalOverdueVal),
          changePeriod: `${overdueInvoices.length} overdue invoices`,
          tone: overdueInvoices.length > 0 ? "warning" : "default",
          iconName: "AlertTriangle",
          scope: "org",
        },
        {
          id: "finance-total-invoices",
          label: "Total Invoices Issued",
          value: invoices.length,
          formattedValue: `${invoices.length} Invoices`,
          changePeriod: "all time ledger",
          iconName: "Clock",
          scope: "org",
        },
      ],
    };
  }, [deals, leads, invoices, users, activities, currentUser]);

  // ==========================================
  // 2. DYNAMIC REVENUE TREND DATA (RECHARTS)
  // ==========================================
  const revenueTrend = useMemo<RevenueDataPoint[]>(() => {
    if (invoices.length === 0 && deals.length === 0) {
      return [];
    }

    const monthMap = new Map<string, { revenue: number; collected: number }>();

    for (let i = 11; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const period = format(startOfMonth(d), "MMM yy");
      monthMap.set(period, { revenue: 0, collected: 0 });
    }

    // Accumulate real invoices
    invoices.forEach((inv) => {
      const dateVal = inv.issue_date || (inv as any).createdAt || (inv as any).created_at;
      if (dateVal) {
        try {
          const key = format(startOfMonth(new Date(dateVal)), "MMM yy");
          if (monthMap.has(key)) {
            const entry = monthMap.get(key)!;
            const amt = Number(inv.total_amount || (inv as any).total || 0);
            entry.revenue += amt;
            if (inv.status === "PAID") {
              entry.collected += amt;
            }
          }
        } catch {
          // ignore invalid date strings
        }
      }
    });

    // Accumulate won deals if invoice dataset is small
    deals
      .filter((d) => d.pipeline?.is_won)
      .forEach((deal) => {
        const dateVal = (deal as any).closed_at || deal.created_at || (deal as any).createdAt;
        if (dateVal) {
          try {
            const key = format(startOfMonth(new Date(dateVal)), "MMM yy");
            if (monthMap.has(key)) {
              const entry = monthMap.get(key)!;
              entry.revenue += Number(deal.amount || 0);
            }
          } catch {
            // ignore
          }
        }
      });

    const result: RevenueDataPoint[] = [];
    monthMap.forEach((val, period) => {
      result.push({
        period,
        revenue: val.revenue,
        target: Math.round(val.revenue * 1.15),
        collected: val.collected,
      });
    });

    const hasAnyValue = result.some((r) => r.revenue > 0 || (r.collected || 0) > 0);
    return hasAnyValue ? result : [];
  }, [invoices, deals]);

  // ==========================================
  // 3. DYNAMIC PIPELINE FUNNEL DATA
  // ==========================================
  const pipelineFunnel = useMemo<FunnelStage[]>(() => {
    if (deals.length === 0) {
      return [];
    }

    const stageMap = new Map<string, { count: number; value: number }>();

    deals.forEach((d) => {
      const stageName = d.pipeline?.name || (d.pipeline?.is_won ? "Closed Won" : d.pipeline?.is_lost ? "Closed Lost" : "Open");
      const current = stageMap.get(stageName) || { count: 0, value: 0 };
      current.count += 1;
      current.value += Number(d.amount || 0);
      stageMap.set(stageName, current);
    });

    const totalDeals = deals.length;
    let idx = 0;
    const stages: FunnelStage[] = [];

    stageMap.forEach((data, name) => {
      idx++;
      const conversionRate = totalDeals > 0 ? Math.round((data.count / totalDeals) * 100) : 0;
      stages.push({
        id: `stage-${idx}`,
        name,
        count: data.count,
        value: data.value,
        conversionRate,
      });
    });

    return stages;
  }, [deals]);

  // ==========================================
  // 4. DYNAMIC LEADERBOARD DATA
  // ==========================================
  const leaderboard = useMemo<LeaderboardRep[]>(() => {
    if (users.length === 0 && deals.length === 0) {
      return [];
    }

    // Build map of performance per user
    const repMap = new Map<string, { name: string; email: string; role: string; revenue: number; wonCount: number; totalCount: number }>();

    // Seed with existing users from user slice (TeamUser has full_name, email, role, id)
    users.forEach((u) => {
      repMap.set(u.id, {
        name: u.full_name || u.email,
        email: u.email,
        role: u.role || "Sales Rep",
        revenue: 0,
        wonCount: 0,
        totalCount: 0,
      });
    });

    // Attribute deals to owners
    deals.forEach((d) => {
      const ownerId = d.owner_id || (d as any).ownerId || d.owner?.id;
      if (ownerId && repMap.has(ownerId)) {
        const rep = repMap.get(ownerId)!;
        rep.totalCount += 1;
        if (d.pipeline?.is_won) {
          rep.wonCount += 1;
          rep.revenue += Number(d.amount || 0);
        }
      } else if (d.owner?.full_name) {
        const repId = d.owner.id || ownerId || "unknown";
        if (!repMap.has(repId)) {
          repMap.set(repId, {
            name: d.owner.full_name,
            email: "",
            role: "Sales Rep",
            revenue: 0,
            wonCount: 0,
            totalCount: 0,
          });
        }
        const rep = repMap.get(repId)!;
        rep.totalCount += 1;
        if (d.pipeline?.is_won) {
          rep.wonCount += 1;
          rep.revenue += Number(d.amount || 0);
        }
      }
    });

    const repsList: LeaderboardRep[] = [];
    repMap.forEach((rep, id) => {
      const winRate = rep.totalCount > 0 ? Math.round((rep.wonCount / rep.totalCount) * 100) : 0;
      repsList.push({
        id,
        name: rep.name,
        email: rep.email,
        role: rep.role,
        closedRevenue: rep.revenue,
        quota: rep.revenue > 0 ? Math.round(rep.revenue * 1.1) : 1000000,
        attainmentPercent: rep.revenue > 0 ? Math.round((rep.revenue / (rep.revenue * 1.1)) * 100) : 0,
        dealsWon: rep.wonCount,
        winRate,
        rank: 1,
      });
    });

    // Sort by closed revenue descending
    repsList.sort((a, b) => b.closedRevenue - a.closedRevenue);
    repsList.forEach((r, i) => {
      r.rank = i + 1;
    });

    return repsList;
  }, [users, deals]);

  // ==========================================
  // 5. DYNAMIC ACTIONABLE TASK QUEUE
  // ==========================================
  const taskQueue = useMemo<TaskItem[]>(() => {
    if (activities.length === 0) {
      return [];
    }

    const now = new Date();
    return activities
      .filter((a) => a.status !== "COMPLETED" && (a.status as string) !== "completed")
      .map((a) => {
        let dueLabel: "Overdue" | "Today" | "Tomorrow" | "Upcoming" = "Upcoming";
        const dateVal = a.due_date || (a as any).dueDate || a.created_at;
        if (dateVal) {
          try {
            const due = new Date(dateVal);
            if (isBefore(due, now) && !isToday(due)) dueLabel = "Overdue";
            else if (isToday(due)) dueLabel = "Today";
            else if (isTomorrow(due)) dueLabel = "Tomorrow";
          } catch {
            dueLabel = "Upcoming";
          }
        }

        const priority =
          a.priority?.toUpperCase() === "HIGH"
            ? "HIGH"
            : a.priority?.toUpperCase() === "LOW"
            ? "LOW"
            : "MEDIUM";

        return {
          id: a.id,
          title: a.title || a.description || "Action Item",
          description: a.description !== a.title ? a.description : undefined,
          dueDate: a.due_date || a.created_at || now.toISOString(),
          dueLabel,
          priority,
          completed: false,
          assigneeName: a.assignee?.full_name || (a.assignee as any)?.name || a.assigned_to || "You",
        };
      });
  }, [activities]);

  // ==========================================
  // 6. DYNAMIC CRITICAL ALERTS
  // ==========================================
  const alerts = useMemo<Record<DashboardRole, AlertItem[]>>(() => {
    const now = new Date();
    const dynamicAlerts: AlertItem[] = [];

    // Overdue invoices check
    const overdueInvoices = invoices.filter(
      (i) => i.status !== "PAID" && i.due_date && isBefore(new Date(i.due_date), now),
    );
    if (overdueInvoices.length > 0) {
      const overdueTotal = overdueInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
      dynamicAlerts.push({
        id: "alert-overdue-invoices",
        title: `${overdueInvoices.length} Invoices Overdue (${formatCurrency(overdueTotal)})`,
        description: `Unpaid accounts have passed their payment due date. Follow-up required.`,
        severity: "critical",
        timestamp: "Immediate",
        actionLabel: "View Invoices",
        actionUrl: "/invoices",
        count: overdueInvoices.length,
      });
    }

    // High value open deals check
    const highValDeals = deals.filter(
      (d) => !d.pipeline?.is_won && !d.pipeline?.is_lost && Number(d.amount || 0) >= 500000,
    );
    if (highValDeals.length > 0) {
      dynamicAlerts.push({
        id: "alert-high-val-deals",
        title: `${highValDeals.length} High-Value Deals in Open Pipeline`,
        description: `Opportunities over ₹5L currently active in negotiation/proposals.`,
        severity: "warning",
        timestamp: "Active",
        actionLabel: "Inspect Deals",
        actionUrl: "/deals",
        count: highValDeals.length,
      });
    }

    // Inbound leads without assignment
    const unassignedLeads = leads.filter(
      (l) => !l.assignee && !(l as any).assigneeId && !(l as any).assignedTo && !(l as any).assigned_to,
    );
    if (unassignedLeads.length > 0) {
      dynamicAlerts.push({
        id: "alert-unassigned-leads",
        title: `${unassignedLeads.length} Inbound Leads Waiting for Triage`,
        description: `New prospective accounts requiring sales rep assignment.`,
        severity: "warning",
        timestamp: "Pending",
        actionLabel: "Assign Leads",
        actionUrl: "/leads",
        count: unassignedLeads.length,
      });
    }

    return {
      ADMIN: dynamicAlerts,
      MANAGER: dynamicAlerts.filter((a) => a.id !== "alert-overdue-invoices" || dynamicAlerts.length <= 1),
      SALES_REP: dynamicAlerts.filter((a) => a.id === "alert-high-val-deals" || a.id === "alert-unassigned-leads"),
      FINANCE: dynamicAlerts.filter((a) => a.id === "alert-overdue-invoices"),
    };
  }, [invoices, deals, leads]);

  return {
    isLoading,
    currentUser,
    metrics: kpiMetrics[role] || kpiMetrics.ADMIN,
    revenueTrend,
    pipelineFunnel,
    leaderboard,
    taskQueue,
    alerts: alerts[role] || alerts.ADMIN,
    activities: activities.slice(0, 10),
    invoices: invoices.slice(0, 10),
    leads: leads.slice(0, 10),
  };
}