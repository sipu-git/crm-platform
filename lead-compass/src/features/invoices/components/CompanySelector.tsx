import { memo } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Company } from "@/features/companies/types/companies.types";

interface CompanySelectorProps {
  companies: Company[];
  isDraft: boolean;
  onSelect: (company: Company) => void;
}

function CompanySelector({ companies, isDraft, onSelect }: CompanySelectorProps) {
  if (!isDraft) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7.5 gap-1.5 border-primary/30 px-2.5 text-xs font-medium text-primary hover:bg-primary/10"
        >
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Populate from Company</span>
          <ChevronDown className="ml-0.5 h-3 w-3 text-primary/70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 w-80 overflow-y-auto p-1.5">
        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Select Registered Company
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            No registered companies found
          </div>
        ) : (
          companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => onSelect(company)}
              className="flex cursor-pointer flex-col items-start gap-1 rounded-lg p-2 hover:bg-muted"
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{company.name}</span>
                {company.gst_number && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.2 font-mono text-[10px] text-primary">
                    GSTIN
                  </span>
                )}
              </div>
              <span className="max-w-[260px] truncate font-mono text-[11px] text-muted-foreground">
                {company.gst_number
                  ? `GST: ${company.gst_number}`
                  : company.city
                    ? `${company.city}, ${company.state || ""}`
                    : "No GST/Address"}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default memo(CompanySelector);
