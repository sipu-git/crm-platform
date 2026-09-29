import React from "react";
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import type { AIEnquiryAnalysis } from "../apis/ai.api";

interface AILeadBadgeProps {
  analysis?: AIEnquiryAnalysis | null;
  isLoading?: boolean;
  onAnalyze?: () => void;
}

export const AILeadBadge: React.FC<AILeadBadgeProps> = ({ analysis, isLoading, onAnalyze }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-300 animate-pulse">
        <Sparkles className="h-4 w-4 animate-spin text-purple-400" />
        <span>AWS Bedrock AI Analyzing Lead...</span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <button
        onClick={onAnalyze}
        className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-300 transition-colors"
      >
        <Sparkles className="h-4 w-4 text-purple-400" />
        <span>Analyze Lead with AI</span>
      </button>
    );
  }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "HIGH_INTENT":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "MEDIUM_INTENT":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "LOW_INTENT":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="rounded-xl border border-purple-500/20 bg-slate-900/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">AI Intelligence Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">{analysis.ai_score}/100</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getIntentColor(analysis.ai_intent)}`}>
            {analysis.ai_intent.replace("_", " ")}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{analysis.ai_summary}</p>

      <div className="flex items-start gap-2 rounded-lg bg-slate-800/60 p-2.5 text-xs text-purple-200">
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-emerald-400">Suggested Action: </span>
          {analysis.ai_suggested_action}
        </div>
      </div>
    </div>
  );
};
