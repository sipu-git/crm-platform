import { Search, Filter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EnquiryStatus } from "@/features/enquiries/types/enquiry.types";
import { STATUS_META, STATUS_ORDER } from "@/features/enquiries/utils/enquiries.constants";

interface EnquiriesToolbarProps {
  query: string;
  status: "ALL" | EnquiryStatus;
  visibleCount: number;
  totalCount: number;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: "ALL" | EnquiryStatus) => void;
}

export function EnquiriesToolbar({
  query,
  status,
  visibleCount,
  totalCount,
  onQueryChange,
  onStatusChange,
}: EnquiriesToolbarProps) {
  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="h-10 w-[280px] pl-9"
              placeholder="Search enquiries"
            />
          </div>
          <Select value={status} onValueChange={(v) => onStatusChange(v as "ALL" | EnquiryStatus)}>
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(query || status !== "ALL") && (
            <span className="text-xs text-muted-foreground">
              {visibleCount} of {totalCount} shown
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            Create enquiry
          </Button>
        </div>
      </div>
    </section>
  );
}
