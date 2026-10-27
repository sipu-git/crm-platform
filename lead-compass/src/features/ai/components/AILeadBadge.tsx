import React from "react";
import { Sparkles, CheckCircle2, Copy, Check, Target, Lightbulb, AlertCircle } from "lucide-react";
import type { AIEnquiryAnalysis } from "../apis/ai.api";
import { toast } from "sonner";

interface AILeadBadgeProps {
  analysis?: AIEnquiryAnalysis | null;
  isLoading?: boolean;
  onAnalyze?: () => void;
}

export const AILeadBadge: React.FC<AILeadBadgeProps> = ({ analysis, isLoading, onAnalyze }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopySummary = () => {
    if (!analysis?.ai_summary) return;
    navigator.clipboard.writeText(
      `AI Lead Score: ${analysis.ai_score}/100 (${analysis.ai_intent})\n\nSummary:\n${analysis.ai_summary}\n\nSuggested Action:\n${analysis.ai_suggested_action}`
    );
    setCopied(true);
    toast.success("AI Analysis copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-4 text-xs font-medium text-foreground animate-pulse shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-500">
            <Sparkles className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">Gemini AI Analyzing Lead...</div>
            <div className="text-muted-foreground text-xs">Evaluating commercial intent, project scope, and recommendation</div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">AI Lead Intelligence</div>
            <div className="text-xs text-muted-foreground">Get intent classification, lead qualification score, and AI-recommended next steps.</div>
          </div>
        </div>
        <button
          onClick={onAnalyze}
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Analyze Lead with AI</span>
        </button>
      </div>
    );
  }

  const getIntentMeta = (intent: string) => {
    switch (intent) {
      case "HIGH_INTENT":
        return {
          label: "High Intent",
          badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
          barColor: "bg-emerald-500",
        };
      case "MEDIUM_INTENT":
        return {
          label: "Medium Intent",
          badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
          barColor: "bg-amber-500",
        };
      case "LOW_INTENT":
        return {
          label: "Low Intent",
          badge: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
          barColor: "bg-blue-500",
        };
      default:
        return {
          label: "Spam / Low Quality",
          badge: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
          barColor: "bg-rose-500",
        };
    }
  };

  const meta = getIntentMeta(analysis.ai_intent);

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-card p-5 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">AI Lead Intelligence</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${meta.badge}`}>
                {meta.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Score</div>
            <div className="text-2xl font-bold tracking-tight text-foreground">{analysis.ai_score}<span className="text-sm font-normal text-muted-foreground">/100</span></div>
          </div>
          <button
            type="button"
            onClick={handleCopySummary}
            title="Copy AI analysis"
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar indicator */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${meta.barColor} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(5, analysis.ai_score))}%` }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground bg-muted/40 rounded-lg p-3 border border-border/50">
          <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">Summary: </span>
            {analysis.ai_summary}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-xs text-foreground">
          <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Suggested Action: </span>
            <span className="text-foreground/90">{analysis.ai_suggested_action}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
