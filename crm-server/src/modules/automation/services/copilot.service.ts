import { invokeBedrockAmazon } from "../bedrock.client";
import { prisma } from "../../../../lib/prisma";

export interface CopilotResult {
  answer: string;
  actionTaken?: string;
}
export interface CopilotResult {
  answer: string;
  actionTaken?: string;
}

export interface CopilotUserContext {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}
export const copilotService = {
  async runCopilotCommand(userPrompt: string, tenantId: string, currentUser?: CopilotUserContext,
    invitedUsers: CopilotUserContext[] = []

  ): Promise<CopilotResult> {
    let crmContextSummary = "";

    try {
      const [leadCount, dealStats, invoiceStats, projectCount, pendingEnquiries, contactCount,
        companyCount, recentLeads, recentDeals,] = await Promise.all([
          prisma.leads.count({
            where: { tenant_id: tenantId },
          }).catch(() => 0),

          prisma.deal.aggregate({
            where: { tenant_id: tenantId },
            _count: { _all: true }, _sum: { amount: true },
          }).catch(() => ({
            _count: { _all: 0 }, _sum: { amount: null },
          })),

          prisma.invoice.aggregate({
            where: { tenant_id: tenantId },
            _count: { _all: true },
            _sum: {
              total_amount: true,
              amount_due: true,
              amount_paid: true,
            },
          }).catch(() => ({
            _count: { _all: 0 },
            _sum: {
              total_amount: null,
              amount_due: null,
              amount_paid: null,
            },
          })),

          prisma.project.count({
            where: { tenant_id: tenantId },
          }).catch(() => 0),

          prisma.enquiry.count({
            where: { isApproved: false },
          }).catch(() => 0),

          prisma.contacts.count({
            where: { tenant_id: tenantId },
          }).catch(() => 0),

          prisma.company.count({
            where: { tenant_id: tenantId },
          }).catch(() => 0),

          prisma.leads.findMany({
            where: { tenant_id: tenantId },
            orderBy: { created_At: "desc" },
            take: 5,
            select: {
              company_name: true,
              status: true,
              project_name: true,
            },
          }).catch(() => []),

          prisma.deal.findMany({
            where: { tenant_id: tenantId },
            orderBy: { created_at: "desc" },
            take: 5,
            select: {
              title: true,
              stage_id: true,
              amount: true,
            },
          }).catch(() => []),
        ]);

      const totalPipelineValue = Number(dealStats._sum?.amount ?? 0);
      const totalInvoiceAmount = Number(
        invoiceStats._sum?.total_amount ?? 0
      );
      const totalAmountDue = Number(invoiceStats._sum?.amount_due ?? 0);
      const totalAmountPaid = Number(invoiceStats._sum?.amount_paid ?? 0);

      crmContextSummary = `
REAL-TIME WORKSPACE DATA:
- Total Leads: ${leadCount}
- Recent Leads: ${recentLeads
          .map(
            (lead) =>
              `${lead.company_name} (Status: ${lead.status}, Project: ${lead.project_name || "N/A"
              })`).join("; ") || "None"
        }
- Total Deals: ${dealStats._count?._all ?? 0}
- Total Pipeline Value: $${totalPipelineValue.toLocaleString()}
- Recent Deals: ${recentDeals.map((deal) => `${deal.title} [Amount: $${Number(deal.amount || 0
        ).toLocaleString()}]`).join("; ") || "None"
        }
- Total Invoices: ${invoiceStats._count?._all ?? 0}
- Total Billed: $${totalInvoiceAmount.toLocaleString()}
- Outstanding Amount: $${totalAmountDue.toLocaleString()}
- Total Paid: $${totalAmountPaid.toLocaleString()}
- Active Projects: ${projectCount}
- Pending Enquiries: ${pendingEnquiries}
- Total Contacts: ${contactCount}
- Total Companies: ${companyCount}
`;
    } catch (error) {
      console.warn(
        "Could not fetch workspace context for AI Copilot:",
        error
      );

      crmContextSummary =
        "Workspace contextual data is currently unavailable.";
    }

    const systemPrompt = `You are Clearview CRM's AI Assistant.

Your job is to answer exactly what the user asks.

STRICT RESPONSE RULES:
1. Use only the workspace data relevant to the user's request.
2. Never provide a general CRM summary.
3. Never mention unrelated modules, metrics, or records.
4. If the user asks about one module or metric, answer only about that module or metric.
5. If the user asks for the total leads, return only the total lead count.
6. Do not mention deals, invoices, contacts, projects, companies, or enquiries unless the user explicitly asks about them.
7. For greetings and casual messages, respond naturally and briefly without using CRM data.
8. Keep the answer to a maximum of 2 short sentences or lines by default.
9. Only provide detailed explanations or lists when the user explicitly requests details.
10. Never expose tenant IDs, UUIDs, database keys, password hashes, API secrets, or internal parameter names.
11. Do not invent data or claim that an action was performed when it was not performed.
12. Return valid JSON only. Do not wrap the JSON in Markdown code fences.

Required JSON format:
{
  "answer": "Direct answer to the user's request",
  "actionTaken": "Short summary of the action performed"
}

Example:
User: "What is the total number of leads?"
Response:
{
  "answer": "There are [number] leads in the workspace.",
  "actionTaken": "Retrieved total lead count"
}

Example:
User: "Good morning"
Response:
{
  "answer": "Good morning! How can I help?",
  "actionTaken": "Responded to greeting"
}`;

    const userContextSummary = `
CURRENT USER:
- Name: ${currentUser?.name || "Unavailable"}
- Email: ${currentUser?.email || "Unavailable"}
- Role: ${currentUser?.role || "Unavailable"}

INVITED USERS:
${invitedUsers.length ? invitedUsers.map((user) => `- Name: ${user.name || "N/A"} | Email: ${user.email || "N/A"
      } | Role: ${user.role || "N/A"}`).join("\n") : "No invited users found."
      }
`;

    const prompt = `USER REQUEST:
"${userPrompt}"

WORKSPACE DATA:
${crmContextSummary}

CURRENT USER AND INVITED USERS:
${userContextSummary}

FINAL INSTRUCTION:
Answer only the user's request. Ignore all workspace data unrelated to the requested module or metric. Do not provide additional CRM information.`;

    const response = await invokeBedrockAmazon(prompt, systemPrompt);

    let answer = response.text || "I have processed your request.";
    let actionTaken = "CRM Assistant Consultation";

    if (response.json?.answer) {
      answer = String(response.json.answer);
      actionTaken = String(
        response.json.actionTaken || "CRM Assistant Consultation"
      );
    }

    const sanitize = (value: string): string => {
      let sanitizedValue = value;

      if (tenantId) {
        sanitizedValue = sanitizedValue.replace(
          new RegExp(tenantId, "g"),
          "[Workspace]"
        );
      }

      return sanitizedValue.replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        "[Ref]"
      );
    };

    return {
      answer: sanitize(answer),
      actionTaken: sanitize(actionTaken),
    };
  },
};