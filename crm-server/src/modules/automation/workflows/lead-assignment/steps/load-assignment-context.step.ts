import { prisma } from "../../../../../../lib/prisma.js";
import type { Candidate, LeadAssignmentOutcome, LeadContext } from "../schemas.js";
import type { LeadAssignmentState } from "../state.js";

export async function loadAssignmentContext(state: LeadAssignmentState) {
  const lead = await prisma.leads.findFirst({
    where: { id: state.leadId, tenant_id: state.tenantId },
    select: {
      id: true,
      tenant_id: true,
      company_name: true,
      project_name: true,
      project_type: true,
      status: true,
      assigned_to: true,
      company: { select: { industry: true, size: true } },
      project: { select: { status: true }, orderBy: { created_at: "desc" }, take: 3 },
    },
  });
  if (!lead) throw new Error(`Lead ${state.leadId} was not found in tenant ${state.tenantId}.`);

  const skip = (reason: Extract<LeadAssignmentOutcome, { status: "skipped" }>['reason']) => ({
    lead: null,
    candidates: [],
    recommendation: null,
    outcome: { status: "skipped" as const, tenantId: state.tenantId, leadId: state.leadId, reason },
  });
  if (lead.assigned_to) return skip("already_assigned");
  if (lead.status === "CONVERTED" || lead.status === "DISQUALIFIED") return skip("lead_not_assignable");

  const salesReps = await prisma.user.findMany({
    where: { tenantId: state.tenantId, role: "SALES_REP" },
    select: { id: true, assignee: { select: { id: true } } },
    orderBy: { id: "asc" },
  });
  if (salesReps.length === 0) return skip("no_eligible_sales_reps");

  const assigneeIds = salesReps.flatMap((rep) => rep.assignee ? [rep.assignee.id] : []);
  const workloadRows = assigneeIds.length > 0
    ? await prisma.leads.groupBy({
        by: ["assigned_to"],
        where: {
          tenant_id: state.tenantId,
          assigned_to: { in: assigneeIds },
          status: { notIn: ["CONVERTED", "DISQUALIFIED"] },
        },
        _count: { _all: true },
      })
    : [];
  const workloadByAssigneeId = new Map(
    workloadRows.flatMap((row) => row.assigned_to ? [[row.assigned_to, row._count._all] as const] : []),
  );
  const candidates: Candidate[] = salesReps.map((rep) => ({
    userId: rep.id,
    activeLeadCount: rep.assignee ? workloadByAssigneeId.get(rep.assignee.id) ?? 0 : 0,
  }));
  const leadContext: LeadContext = {
    companyName: lead.company_name,
    projectName: lead.project_name,
    projectType: lead.project_type,
    industry: lead.company.industry,
    companySize: lead.company.size,
    relatedProjectStatuses: lead.project.map((project) => project.status),
  };
  return { lead: leadContext, candidates, recommendation: null, outcome: null };
}
