import { memo } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface DealHealthButtonProps {
  isAnalyzing?: boolean;
  onAnalyze: () => void;
}

function DealHealthButton({ isAnalyzing = false, onAnalyze }: DealHealthButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onAnalyze();
      }}
      disabled={isAnalyzing}
      title="Analyze deal health with AI"
      className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
    >
      {isAnalyzing ? (
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
    </button>
  );
}

export default memo(DealHealthButton);
