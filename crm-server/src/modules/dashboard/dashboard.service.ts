import { dashboardRepository } from './dashboard.repository.js';
import { format, startOfMonth, subMonths, isBefore, isToday, isTomorrow } from 'date-fns';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export const dashboardService = {
    async getOverview(tenantId: string, userId: string, role: string, tenantSlug: string = '') {
        const isSalesRep = role === 'SALES_REP';

        const [
            metricsData,
            revenueData,
            funnelData,
            leaderboardData,
            rawTasks,
            recentItems,
        ] = await Promise.all([
            dashboardRepository.getMetrics(tenantId, userId, role),
            dashboardRepository.getRevenueTrend(tenantId),
            dashboardRepository.getPipelineFunnel(tenantId),
            dashboardRepository.getLeaderboard(tenantId),
            dashboardRepository.getTaskQueue(tenantId, userId, isSalesRep),
            dashboardRepository.getRecentItems(tenantId, userId, isSalesRep),
        ]);

        // ==========================================
        // 1. KPI METRICS FOR EACH ROLE
        // ==========================================
        const kpiMetrics = {
            ADMIN: [
                {
                    id: 'admin-arr',
                    label: 'Closed Revenue (ARR)',
                    value: metricsData.closedRevenueVal,
                    formattedValue: formatCurrency(metricsData.closedRevenueVal),
                    changePeriod: `${metricsData.wonDealsCount} won deals`,
                    iconName: 'DollarSign',
                    scope: 'org',
                },
                {
                    id: 'admin-mrr',
                    label: 'Monthly Run Rate (MRR)',
                    value: metricsData.mrrVal,
                    formattedValue: formatCurrency(metricsData.mrrVal),
                    changePeriod: 'estimated monthly',
                    iconName: 'TrendingUp',
                    scope: 'org',
                },
                {
                    id: 'admin-pipeline',
                    label: 'Total Open Pipeline',
                    value: metricsData.totalPipelineVal,
                    formattedValue: formatCurrency(metricsData.totalPipelineVal),
                    changePeriod: `${metricsData.openDealsCount} open deals`,
                    iconName: 'Layers',
                    scope: 'org',
                },
                {
                    id: 'admin-winrate',
                    label: 'Org Win Rate',
                    value: `${metricsData.winRateVal}%`,
                    formattedValue: `${metricsData.winRateVal}%`,
                    changePeriod: `${metricsData.wonDealsCount} of ${metricsData.totalDealsCount} total deals`,
                    iconName: 'Target',
                    scope: 'org',
                },
                {
                    id: 'admin-team',
                    label: 'Workspace Members',
                    value: metricsData.activeTeamCount,
                    formattedValue: `${metricsData.activeTeamCount} Members`,
                    changePeriod: 'registered users',
                    iconName: 'Users',
                    scope: 'org',
                },
            ],
            MANAGER: [
                {
                    id: 'manager-pipeline',
                    label: 'Team Pipeline Value',
                    value: metricsData.totalPipelineVal,
                    formattedValue: formatCurrency(metricsData.totalPipelineVal),
                    changePeriod: `${metricsData.openDealsCount} active opportunities`,
                    iconName: 'TrendingUp',
                    scope: 'team',
                },
                {
                    id: 'manager-deals-closed',
                    label: 'Team Closed Revenue',
                    value: metricsData.closedRevenueVal,
                    formattedValue: formatCurrency(metricsData.closedRevenueVal),
                    changePeriod: `${metricsData.wonDealsCount} deals won`,
                    iconName: 'CheckCircle2',
                    scope: 'team',
                },
                {
                    id: 'manager-winrate',
                    label: 'Team Win Rate',
                    value: `${metricsData.winRateVal}%`,
                    formattedValue: `${metricsData.winRateVal}%`,
                    changePeriod: `${metricsData.totalDealsCount} total evaluated deals`,
                    iconName: 'Award',
                    scope: 'team',
                },
                {
                    id: 'manager-leads',
                    label: 'Active Inbound Leads',
                    value: metricsData.activeLeadCount,
                    formattedValue: `${metricsData.activeLeadCount} Leads`,
                    changePeriod: 'in pipeline',
                    iconName: 'Zap',
                    scope: 'team',
                },
            ],
            SALES_REP: [
                {
                    id: 'rep-pipeline',
                    label: 'My Open Pipeline',
                    value: metricsData.myPipelineVal,
                    formattedValue: formatCurrency(metricsData.myPipelineVal),
                    changePeriod: `${metricsData.myOpenDealsCount} active deals`,
                    iconName: 'Briefcase',
                    scope: 'own',
                },
                {
                    id: 'rep-revenue',
                    label: 'My Closed Revenue',
                    value: metricsData.myClosedRevenue,
                    formattedValue: formatCurrency(metricsData.myClosedRevenue),
                    changePeriod: `${metricsData.myWonDealsCount} won deals`,
                    iconName: 'Trophy',
                    scope: 'own',
                },
                {
                    id: 'rep-winrate',
                    label: 'My Win Rate',
                    value: `${metricsData.myWinRate}%`,
                    formattedValue: `${metricsData.myWinRate}%`,
                    changePeriod: 'won ratio',
                    iconName: 'Target',
                    scope: 'own',
                },
                {
                    id: 'rep-activities',
                    label: 'Activities Logged',
                    value: metricsData.activitiesCount,
                    formattedValue: `${metricsData.activitiesCount} Logged`,
                    changePeriod: 'calls, emails, meetings',
                    iconName: 'PhoneCall',
                    scope: 'own',
                },
            ],
            FINANCE: [
                {
                    id: 'finance-collected',
                    label: 'Cash Collected',
                    value: metricsData.totalCollectedVal,
                    formattedValue: formatCurrency(metricsData.totalCollectedVal),
                    changePeriod: `${metricsData.paidInvoicesCount} paid invoices`,
                    iconName: 'DollarSign',
                    scope: 'org',
                },
                {
                    id: 'finance-ar',
                    label: 'Total Accounts Receivable',
                    value: metricsData.totalOutstandingARVal,
                    formattedValue: formatCurrency(metricsData.totalOutstandingARVal),
                    changePeriod: `${metricsData.unpaidInvoicesCount} unpaid invoices`,
                    iconName: 'CreditCard',
                    scope: 'org',
                },
                {
                    id: 'finance-overdue',
                    label: 'Overdue Invoices',
                    value: metricsData.totalOverdueVal,
                    formattedValue: formatCurrency(metricsData.totalOverdueVal),
                    changePeriod: `${metricsData.overdueInvoicesCount} overdue invoices`,
                    tone: metricsData.overdueInvoicesCount > 0 ? 'warning' : 'default',
                    iconName: 'AlertTriangle',
                    scope: 'org',
                },
                {
                    id: 'finance-total-invoices',
                    label: 'Total Invoices Issued',
                    value: metricsData.totalInvoicesCount,
                    formattedValue: `${metricsData.totalInvoicesCount} Invoices`,
                    changePeriod: 'all time ledger',
                    iconName: 'Clock',
                    scope: 'org',
                },
            ],
        };

        // ==========================================
        // 2. REVENUE TREND (12 Month Rollup)
        // ==========================================
        const monthMap = new Map<string, { revenue: number; collected: number }>();
        for (let i = 11; i >= 0; i--) {
            const d = subMonths(new Date(), i);
            const period = format(startOfMonth(d), 'MMM yy');
            monthMap.set(period, { revenue: 0, collected: 0 });
        }

        revenueData.invoices.forEach((inv) => {
            const dateVal = inv.issue_date || inv.created_at;
            if (dateVal) {
                try {
                    const key = format(startOfMonth(new Date(dateVal)), 'MMM yy');
                    if (monthMap.has(key)) {
                        const entry = monthMap.get(key)!;
                        const amt = Number(inv.total_amount || 0);
                        entry.revenue += amt;
                        if (inv.status === 'PAID') {
                            entry.collected += amt;
                        }
                    }
                } catch {
                    // Ignore
                }
            }
        });

        revenueData.wonDeals.forEach((deal) => {
            if (deal.created_at) {
                try {
                    const key = format(startOfMonth(new Date(deal.created_at)), 'MMM yy');
                    if (monthMap.has(key)) {
                        const entry = monthMap.get(key)!;
                        entry.revenue += Number(deal.amount || 0);
                    }
                } catch {
                    // Ignore
                }
            }
        });

        const revenueTrend: any[] = [];
        monthMap.forEach((val, period) => {
            revenueTrend.push({
                period,
                revenue: val.revenue,
                target: Math.round(val.revenue * 1.15),
                collected: val.collected,
            });
        });

        // ==========================================
        // 3. PIPELINE FUNNEL STAGES
        // ==========================================
        const stageMap = new Map<string, { count: number; value: number }>();
        funnelData.deals.forEach((d) => {
            const stageName = d.pipeline?.name || 'Open';
            const current = stageMap.get(stageName) || { count: 0, value: 0 };
            current.count += 1;
            current.value += Number(d.amount || 0);
            stageMap.set(stageName, current);
        });

        const totalDeals = funnelData.deals.length;
        let idx = 0;
        const pipelineFunnel: any[] = [];
        stageMap.forEach((data, name) => {
            idx++;
            const conversionRate = totalDeals > 0 ? Math.round((data.count / totalDeals) * 100) : 0;
            pipelineFunnel.push({
                id: `stage-${idx}`,
                name,
                count: data.count,
                value: data.value,
                conversionRate,
            });
        });

        // ==========================================
        // 4. LEADERBOARD
        // ==========================================
        const repMap = new Map<string, { name: string; email: string; role: string; revenue: number; wonCount: number; totalCount: number }>();
        leaderboardData.users.forEach((u) => {
            repMap.set(u.id, {
                name: u.full_name || u.email,
                email: u.email,
                role: u.role || 'Sales Rep',
                revenue: 0,
                wonCount: 0,
                totalCount: 0,
            });
        });

        leaderboardData.deals.forEach((d) => {
            if (d.owner_id && repMap.has(d.owner_id)) {
                const rep = repMap.get(d.owner_id)!;
                rep.totalCount += 1;
                if (d.pipeline?.is_won) {
                    rep.wonCount += 1;
                    rep.revenue += Number(d.amount || 0);
                }
            } else if (d.owner?.full_name) {
                const repId = d.owner.id || d.owner_id || 'unknown';
                if (!repMap.has(repId)) {
                    repMap.set(repId, {
                        name: d.owner.full_name,
                        email: d.owner.email || '',
                        role: d.owner.role || 'Sales Rep',
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

        const leaderboard: any[] = [];
        repMap.forEach((rep, id) => {
            const winRate = rep.totalCount > 0 ? Math.round((rep.wonCount / rep.totalCount) * 100) : 0;
            leaderboard.push({
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

        leaderboard.sort((a, b) => b.closedRevenue - a.closedRevenue);
        leaderboard.forEach((r, i) => {
            r.rank = i + 1;
        });

        // ==========================================
        // 5. TASK QUEUE
        // ==========================================
        const now = new Date();
        const taskQueue = rawTasks.map((a) => {
            let dueLabel: 'Overdue' | 'Today' | 'Tomorrow' | 'Upcoming' = 'Upcoming';
            if (a.due_date) {
                try {
                    const due = new Date(a.due_date);
                    if (isBefore(due, now) && !isToday(due)) dueLabel = 'Overdue';
                    else if (isToday(due)) dueLabel = 'Today';
                    else if (isTomorrow(due)) dueLabel = 'Tomorrow';
                } catch {
                    dueLabel = 'Upcoming';
                }
            }

            const priority =
                a.priority?.toUpperCase() === 'HIGH'
                    ? 'HIGH'
                    : a.priority?.toUpperCase() === 'LOW'
                        ? 'LOW'
                        : 'MEDIUM';

            const assigneeName =
                a.assignee?.user?.full_name || a.user?.full_name || 'Unassigned';

            return {
                id: a.id,
                title: a.title || a.description || 'Action Item',
                description: a.description !== a.title ? a.description : undefined,
                dueDate: a.due_date ? new Date(a.due_date).toISOString() : now.toISOString(),
                dueLabel,
                priority,
                completed: false,
                assigneeName,
            };
        });

        // ==========================================
        // 6. DYNAMIC ALERTS
        // ==========================================
        const dynamicAlerts: any[] = [];
        if (metricsData.overdueInvoicesCount > 0) {
            dynamicAlerts.push({
                id: 'alert-overdue-invoices',
                title: `${metricsData.overdueInvoicesCount} Invoices Overdue (${formatCurrency(metricsData.totalOverdueVal)})`,
                description: 'Unpaid accounts have passed their payment due date. Follow-up required.',
                severity: 'critical',
                timestamp: 'Immediate',
                actionLabel: 'View Invoices',
                actionUrl: `/${tenantSlug}/invoices`,
                count: metricsData.overdueInvoicesCount,
            });
        }

        const highValDeals = metricsData.allDeals.filter(
            (d) => !d.pipeline?.is_won && !d.pipeline?.is_lost && Number(d.amount || 0) >= 500000
        );
        if (highValDeals.length > 0) {
            dynamicAlerts.push({
                id: 'alert-high-val-deals',
                title: `${highValDeals.length} High-Value Deals in Open Pipeline`,
                description: 'Opportunities over ₹5L currently active in negotiation/proposals.',
                severity: 'warning',
                timestamp: 'Active',
                actionLabel: 'Inspect Deals',
                actionUrl: `/${tenantSlug}/deals`,
                count: highValDeals.length,
            });
        }

        const alerts = {
            ADMIN: dynamicAlerts,
            MANAGER: dynamicAlerts.filter((a) => a.id !== 'alert-overdue-invoices' || dynamicAlerts.length <= 1),
            SALES_REP: dynamicAlerts.filter((a) => a.id === 'alert-high-val-deals'),
            FINANCE: dynamicAlerts.filter((a) => a.id === 'alert-overdue-invoices'),
        };

        const activeRole = (role as 'ADMIN' | 'MANAGER' | 'SALES_REP' | 'FINANCE') || 'ADMIN';

        return {
            metrics: kpiMetrics[activeRole] || kpiMetrics.ADMIN,
            revenueTrend,
            pipelineFunnel,
            leaderboard,
            taskQueue,
            alerts: alerts[activeRole] || alerts.ADMIN,
            activities: recentItems.activities,
            invoices: recentItems.invoices,
            leads: recentItems.leads,
        };
    },
};

