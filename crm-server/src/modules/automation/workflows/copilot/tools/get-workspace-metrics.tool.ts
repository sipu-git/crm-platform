import { tool } from "langchain";
import { z } from "zod";
import { dashboardService } from "../../../../dashboard/dashboard.service.js";
import type { AccessTokenPayload } from "../../../../../shared/utils/jwt.js";

export function createWorkspaceMetricsTool(actor: AccessTokenPayload) {
  return tool(
    async () => {
      const { metrics } = await dashboardService.getKpis(actor.tenantId, actor.userId, actor.role);
      return JSON.stringify({
        scope: "tenant dashboard metrics",
        metrics: metrics.map((metric) => ({
          label: metric.label,
          value: metric.value,
          formattedValue: metric.formattedValue,
          changePeriod: metric.changePeriod,
        })),
      });
    },
    {
      name: "get_workspace_metrics",
      description: "Read aggregate dashboard KPIs for the authenticated user's CRM workspace. This tool does not change CRM data.",
      schema: z.object({}),
    },
  );
}
