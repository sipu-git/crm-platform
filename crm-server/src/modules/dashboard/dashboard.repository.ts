import { prisma } from '../../../lib/prisma.js';

export const dashboardRepository = {
    async getMetrics(tenantId: string, userId: string, role: string) {
        const isSalesRep = role === 'SALES_REP';

        // 1. Deals Aggregation (Org level)
        const [allDeals, wonDeals, openDeals] = await Promise.all([
            prisma.deal.findMany({
                where: { tenant_id: tenantId },
                select: {
                    id: true,
                    amount: true,
                    owner_id: true,
                    pipeline: { select: { is_won: true, is_lost: true } },
                },
            }),
            prisma.deal.findMany({
                where: { tenant_id: tenantId, pipeline: { is_won: true } },
                select: { id: true, amount: true, owner_id: true },
            }),
            prisma.deal.findMany({
                where: { tenant_id: tenantId, pipeline: { is_won: false, is_lost: false } },
                select: { id: true, amount: true, owner_id: true },
            }),
        ]);

        const totalDealsCount = allDeals.length;
        const wonDealsCount = wonDeals.length;
        const openDealsCount = openDeals.length;

        const closedRevenueVal = wonDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        const totalPipelineVal = openDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        const winRateVal = totalDealsCount > 0 ? Math.round((wonDealsCount / totalDealsCount) * 100) : 0;
        const mrrVal = Math.round(closedRevenueVal / 12);

        // 2. Invoices Aggregation (Org level)
        const now = new Date();
        const allInvoices = await prisma.invoice.findMany({
            where: { tenant_id: tenantId },
            select: {
                id: true,
                status: true,
                total_amount: true,
                due_date: true,
                issue_date: true,
                created_at: true,
            },
        });

        const paidInvoices = allInvoices.filter((i) => i.status === 'PAID');
        const unpaidInvoices = allInvoices.filter((i) => i.status !== 'PAID');
        const overdueInvoices = unpaidInvoices.filter((i) => i.due_date && new Date(i.due_date) < now);

        const totalCollectedVal = paidInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
        const totalOutstandingARVal = unpaidInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
        const totalOverdueVal = overdueInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);

        // 3. Counts
        const [activeLeadCount, activeTeamCount, activitiesCount] = await Promise.all([
            prisma.leads.count({ where: { tenant_id: tenantId } }),
            prisma.user.count({ where: { tenantId } }),
            isSalesRep
                ? prisma.activities.count({
                    where: { tenant_id: tenantId, OR: [{ created_by: userId }, { assigned_to: userId }] },
                })
                : prisma.activities.count({ where: { tenant_id: tenantId } }),
        ]);

        // 4. Sales Rep Specific Metrics
        const myDeals = allDeals.filter((d) => d.owner_id === userId);
        const myWonDeals = myDeals.filter((d) => d.pipeline?.is_won);
        const myOpenDeals = myDeals.filter((d) => !d.pipeline?.is_won && !d.pipeline?.is_lost);

        const myPipelineVal = myOpenDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        const myClosedRevenue = myWonDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        const myWinRate = myDeals.length > 0 ? Math.round((myWonDeals.length / myDeals.length) * 100) : winRateVal;

        return {
            closedRevenueVal,
            mrrVal,
            totalPipelineVal,
            openDealsCount,
            wonDealsCount,
            totalDealsCount,
            winRateVal,
            activeLeadCount,
            activeTeamCount,
            totalCollectedVal,
            totalOutstandingARVal,
            totalOverdueVal,
            paidInvoicesCount: paidInvoices.length,
            unpaidInvoicesCount: unpaidInvoices.length,
            overdueInvoicesCount: overdueInvoices.length,
            totalInvoicesCount: allInvoices.length,
            // Rep metrics
            myPipelineVal,
            myClosedRevenue,
            myWinRate,
            myOpenDealsCount: myOpenDeals.length,
            myWonDealsCount: myWonDeals.length,
            activitiesCount,
            allInvoices,
            allDeals,
        };
    },

    async getRevenueTrend(tenantId: string) {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const [invoices, wonDeals] = await Promise.all([
            prisma.invoice.findMany({
                where: {
                    tenant_id: tenantId,
                    created_at: { gte: twelveMonthsAgo },
                },
                select: {
                    id: true,
                    total_amount: true,
                    status: true,
                    issue_date: true,
                    created_at: true,
                },
            }),
            prisma.deal.findMany({
                where: {
                    tenant_id: tenantId,
                    pipeline: { is_won: true },
                    created_at: { gte: twelveMonthsAgo },
                },
                select: {
                    id: true,
                    amount: true,
                    created_at: true,
                },
            }),
        ]);

        return { invoices, wonDeals };
    },

    async getPipelineFunnel(tenantId: string) {
        const [stages, deals] = await Promise.all([
            prisma.pipeline.findMany({
                where: { tenant_id: tenantId },
                orderBy: { sort_order: 'asc' },
                select: { id: true, name: true, is_won: true, is_lost: true },
            }),
            prisma.deal.findMany({
                where: { tenant_id: tenantId },
                select: {
                    id: true,
                    amount: true,
                    stage_id: true,
                    pipeline: { select: { name: true, is_won: true, is_lost: true } },
                },
            }),
        ]);

        return { stages, deals };
    },

    async getLeaderboard(tenantId: string) {
        const [users, deals] = await Promise.all([
            prisma.user.findMany({
                where: { tenantId },
                select: { id: true, full_name: true, email: true, role: true },
            }),
            prisma.deal.findMany({
                where: { tenant_id: tenantId },
                select: {
                    id: true,
                    amount: true,
                    owner_id: true,
                    pipeline: { select: { is_won: true } },
                    owner: { select: { id: true, full_name: true, email: true, role: true } },
                },
            }),
        ]);

        return { users, deals };
    },

    async getTaskQueue(tenantId: string, userId: string, isSalesRep: boolean) {
        return prisma.activities.findMany({
            where: {
                tenant_id: tenantId,
                status: { not: 'COMPLETED' },
                ...(isSalesRep ? { OR: [{ created_by: userId }, { assigned_to: userId }] } : {}),
            },
            take: 20,
            orderBy: { due_date: 'asc' },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                due_date: true,
                created_at: true,
                assigned_to: true,
                user: { select: { full_name: true } },
                assignee: { select: { user: { select: { full_name: true } } } },
            },
        });
    },

    async getRecentItems(tenantId: string, userId: string, isSalesRep: boolean) {
        const [activities, invoices, leads] = await Promise.all([
            prisma.activities.findMany({
                where: {
                    tenant_id: tenantId,
                    ...(isSalesRep ? { OR: [{ created_by: userId }, { assigned_to: userId }] } : {}),
                },
                take: 10,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true,
                    due_date: true,
                    created_at: true,
                },
            }),
            prisma.invoice.findMany({
                where: { tenant_id: tenantId },
                take: 10,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    invoice_number: true,
                    status: true,
                    total_amount: true,
                    issue_date: true,
                    due_date: true,
                    created_at: true,
                },
            }),
            prisma.leads.findMany({
                where: { tenant_id: tenantId },
                take: 10,
                orderBy: { created_At: 'desc' },
                select: {
                    id: true,
                    company_name: true,
                    status: true,
                    created_At: true,
                    assignee: true,
                },
            }),
        ]);

        return { activities, invoices, leads };
    },
};

