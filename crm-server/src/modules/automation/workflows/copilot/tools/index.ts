import type { ClientTool } from "@langchain/core/tools";
import type { AccessTokenPayload } from "../../../../../shared/utils/jwt.js";
import { createWorkspaceMetricsTool } from "./get-workspace-metrics.tool.js";
import { createLeadSearchTool } from "./search-leads.tool.js";

/** Build only the read-only tools the authenticated CRM role is allowed to use. */
export function createCopilotTools(actor: AccessTokenPayload): ClientTool[] {
  const tools: ClientTool[] = [];
  if (actor.role === "ADMIN" || actor.role === "MANAGER") {
    tools.push(createWorkspaceMetricsTool(actor));
  }
  if (["ADMIN", "MANAGER", "SALES_REP"].includes(actor.role)) {
    tools.push(createLeadSearchTool(actor));
  }
  return tools;
}
