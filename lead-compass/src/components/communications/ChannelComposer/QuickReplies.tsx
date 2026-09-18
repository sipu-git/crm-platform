import { QUICK_REPLIES } from "@/utils/constants";
import { Sparkle } from "lucide-react";

export function QuickReplies({ onPick }: { onPick: (text: string) => void }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {QUICK_REPLIES.map((q) => (
                <button
                    key={q}
                    type="button"
                    onClick={() => onPick(q)}
                    className="flex items-center gap-1 rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                    <Sparkle className="h-3 w-3" />
                    {q}
                </button>
            ))}
        </div>
    );
}