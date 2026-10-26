import { tool } from "langchain";
import { z } from "zod";
import { leadService } from "../../../../lead/services/lead.service.js";
import type { AccessTokenPayload } from "../../../../../shared/utils/jwt.js";

export function createLeadSearchTool(actor: AccessTokenPayload) {
  return tool(
    async ({ query, limit }) => {
      const matches = await leadService.searchLeads(actor.tenantId, query.trim(), limit, actor);
      const leads = matches.map((lead) => ({
        company: lead.company_name,
        project: lead.project_name,
        projectType: lead.project_type,
        status: lead.status,
        source: lead.source,
        createdAt: lead.created_At,
      }));
      return JSON.stringify({ query, count: leads.length, leads });
    },
    {
      name: "search_leads",
      description: "Search CRM leads by company or project name. Results follow the authenticated user's CRM permissions and contain no contact email or phone. This tool is read-only.",
      schema: z.object({
        query: z.string().trim().min(2).max(100).describe("Company or project name to search for"),
        limit: z.number().int().min(1).max(5).default(5),
      }),
    },
  );
}
