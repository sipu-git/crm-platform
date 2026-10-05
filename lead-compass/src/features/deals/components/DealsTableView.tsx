import { memo } from "react";
import { Link } from "react-router-dom";
import { formatFullName } from "@/hooks/use-format";
import type { Deal } from "@/features/deals/deal.types";
import { formatDealAmount, formatDealDate } from "@/features/deals/components/deal-formatters";

interface DealsTableViewProps {
  deals: Deal[];
  tenantSlug: string;
}

function DealsTableView({ deals, tenantSlug }: DealsTableViewProps) {
  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <div className="overflow-x-auto scroller-hide rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Deal</th>
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 font-medium">Contact</th>
              <th className="px-3 py-2 font-medium">Stage</th>
              <th className="px-3 py-2 font-medium">Amount</th>
              <th className="px-3 py-2 font-medium">Close date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {deals.map((deal) => (
              <tr key={deal.id} className="hover:bg-muted/40">
                <td className="px-3 py-2.5 font-medium">
                  <Link to={`/${tenantSlug}/deals/${deal.id}`} className="hover:underline">
                    {deal.title}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {deal.leads?.company_name ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatFullName(deal.contact?.first_name, deal.contact?.last_name) || "—"}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: deal.pipeline?.is_won
                        ? "#22c55e1a"
                        : deal.pipeline?.is_lost
                          ? "#ef44441a"
                          : "#3b82f61a",
                      color: deal.pipeline?.is_won
                        ? "#22c55e"
                        : deal.pipeline?.is_lost
                          ? "#ef4444"
                          : "#3b82f6",
                    }}
                  >
                    {deal.pipeline?.name ?? "—"}
                  </span>
                </td>
                <td className="px-3 py-2.5">{formatDealAmount(deal.amount)}</td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatDealDate(deal.expected_close_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(DealsTableView);
