import { Lightbulb, Target } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { humanize } from "@/features/leads/components/status-meta";
import { LEAD_SOURCES, Source } from "@/features/leads/types/lead.types";
import InfoCard from "../InfoCard";

export function LeadSourceCard({ source, saving, onChange }: { source: Source; saving: boolean; onChange: (v: string) => void }) {
  return (
    <InfoCard title="Lead source" icon={<Target className="h-4 w-4 text-primary" />}>
      <div className="space-y-4">
        <Select value={source} onValueChange={onChange} disabled={saving}>
          <SelectTrigger className="h-9 w-full bg-background" data-testid="source-select"><SelectValue /></SelectTrigger>
          <SelectContent>
            {LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground border border-border/50">
          <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
          <p className="leading-relaxed">A webinar signup is warm and time-sensitive; a general website form usually needs a qualifying call first.</p>
        </div>
      </div>
    </InfoCard>
  );
}