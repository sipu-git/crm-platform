import { useState } from "react";
import { Sparkles, Loader2, AlertTriangle, ShieldAlert, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEvaluateDealHealthMutation } from "@/features/ai/hooks/useAi";
import type { AIDealHealthAnalysis } from "@/features/ai/apis/ai.api";

interface DealHealthPanelProps {
  dealName: string;
  stage: string;
  amount: number;
  daysInStage: number;
  hasOverdueInvoice: boolean;
  lastActivityDaysAgo: number;
}

export function DealHealthPanel(props: DealHealthPanelProps) {
  const [result, setResult] = useState<AIDealHealthAnalysis | null>(null);
  const mutation = useEvaluateDealHealthMutation();

  async function analyze() {
    try {
      const data = await mutation.mutateAsync(props);
      setResult(data);
    } catch {
      // mutation.isError handles the UI
    }
  }

  const scoreColor = !result
    ? "text-muted-foreground"
    : result.health_score >= 70
      ? "text-emerald-600"
      : result.health_score >= 40
        ? "text-amber-600"
        : "text-rose-600";

  const scoreBg = !result
    ? "bg-muted"
    : result.health_score >= 70
      ? "bg-emerald-500/10"
      : result.health_score >= 40
        ? "bg-amber-500/10"
        : "bg-rose-500/10";

  const winBg =
    !result
      ? "bg-muted"
      : result.win_probability >= 60
        ? "bg-primary/5"
        : result.win_probability >= 30
          ? "bg-amber-500/10"
          : "bg-rose-500/10";

  const winColor =
    !result
      ? "text-muted-foreground"
      : result.win_probability >= 60
        ? "text-primary"
        : result.win_probability >= 30
          ? "text-amber-600"
          : "text-rose-600";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div>
              <CardTitle className="text-sm font-medium">AI Deal Health</CardTitle>
              <CardDescription className="text-[11px]">
                Predictive deal scoring
              </CardDescription>
            </div>
          </div>
          {!result && (
            <Button
              size="sm"
              variant="outline"
              onClick={analyze}
              disabled={mutation.isPending}
              className="h-7 gap-1.5 text-xs"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" /> Analyze
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {!result && !mutation.isError && !mutation.isPending && (
        <CardContent className="pb-4">
          <div className="rounded-xl border border-dashed p-4 text-center">
            <Sparkles className="mx-auto mb-2 h-5 w-5 text-muted-foreground/50" />
            <p className="text-xs font-medium">Run AI analysis</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Get a health score, win probability, and risk factors for this deal.
            </p>
          </div>
        </CardContent>
      )}

      {mutation.isPending && !result && (
        <CardContent className="pb-4">
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Analyzing deal data…</p>
          </div>
        </CardContent>
      )}

      {result && (
        <CardContent className="space-y-4 pb-4">
          {/* Score + Win Probability */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl p-3 text-center ${scoreBg}`}>
              <div className={`text-2xl font-bold ${scoreColor}`}>
                {result.health_score}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">Health Score</div>
            </div>
            <div className={`rounded-xl p-3 text-center ${winBg}`}>
              <div className={`text-2xl font-bold ${winColor}`}>
                {result.win_probability}%
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">Win Probability</div>
            </div>
          </div>

          {/* Risk Factors */}
          {result.risk_factors.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <AlertTriangle className="h-3 w-3" /> Risk Factors
              </div>
              <ul className="space-y-1.5">
                {result.risk_factors.map((risk, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-muted/50 px-2.5 py-2 text-xs"
                  >
                    <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                    <span className="text-foreground">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.risk_factors.length === 0 && (
            <div className="rounded-lg bg-emerald-500/5 px-3 py-2.5 text-center text-xs text-emerald-700 dark:text-emerald-400">
              ✓ No significant risk factors detected
            </div>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={analyze}
            disabled={mutation.isPending}
            className="w-full text-xs"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Re-analyzing…
              </>
            ) : (
              <>
                <RefreshCw className="mr-1.5 h-3 w-3" /> Re-analyze
              </>
            )}
          </Button>
        </CardContent>
      )}

      {mutation.isError && (
        <CardContent className="pb-4">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-center">
            <p className="text-xs text-destructive">
              Failed to analyze deal health.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={analyze}
              className="mt-2 h-7 text-xs"
            >
              Try again
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
