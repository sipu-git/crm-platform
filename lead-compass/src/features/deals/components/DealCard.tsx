import { memo } from "react";
import { Link } from "react-router-dom";
import { Building2, Calendar, TrendingUp, User } from "lucide-react";
import { formatFullName } from "@/hooks/use-format";
import type { Deal } from "@/features/deals/deal.types";
import type { AIDealHealthAnalysis } from "@/features/ai/apis/ai.api";
import DealHealthButton from "@/features/deals/components/DealHealthButton";
import { formatDealAmount, formatDealDate } from "@/features/deals/components/deal-formatters";

interface DealCardProps {
  deal: Deal;
  tenantSlug: string;
  dragging?: boolean;
  health?: AIDealHealthAnalysis;
  isAnalyzing?: boolean;
  onAnalyze?: () => void;
}

function healthScoreStyle(score: number) {
  if (score >= 70) return { bg: "bg-emerald-500/10", text: "text-emerald-600" };
  if (score >= 40) return { bg: "bg-amber-500/10", text: "text-amber-600" };
  return { bg: "bg-rose-500/10", text: "text-rose-600" };
}

function DealCard({ deal, tenantSlug, dragging, health, isAnalyzing, onAnalyze }: DealCardProps) {
  const contactName = formatFullName(deal.contact?.first_name, deal.contact?.last_name);
  const companyName = deal.leads?.company_name;
  const style = health ? healthScoreStyle(health.health_score) : null;

  return (
    <Link
      to={`/${tenantSlug}/deals/${deal.id}`}
      onClick={(event) => dragging && event.preventDefault()}
      className={`block rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow ${
        dragging ? "cursor-grabbing shadow-lg ring-2 ring-primary/40" : "cursor-grab"
      }`}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <span className="text-sm font-medium leading-snug">{deal.title}</span>

        {!dragging && onAnalyze && (
          <span className="shrink-0">
            {health ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${style!.bg} ${style!.text}`}
                title={`Health: ${health.health_score} · Win: ${health.win_probability}%`}
              >
                <TrendingUp className="h-2.5 w-2.5" />
                {health.health_score}
              </span>
            ) : (
              <DealHealthButton isAnalyzing={isAnalyzing} onAnalyze={onAnalyze} />
            )}
          </span>
        )}
      </div>

      {companyName && (
        <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3" />
          {companyName}
        </div>
      )}
      {contactName && (
        <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          {contactName}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{formatDealAmount(deal.amount)}</span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDealDate(deal.expected_close_date)}
        </span>
      </div>

      {health && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Win probability</span>
            <span className={`font-semibold ${style!.text}`}>{health.win_probability}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                health.win_probability >= 60
                  ? "bg-emerald-500"
                  : health.win_probability >= 30
                    ? "bg-amber-500"
                    : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(health.win_probability, 100)}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}

export default memo(DealCard);
