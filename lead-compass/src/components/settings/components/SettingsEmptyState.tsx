import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SettingsSectionId } from "../types/settings.types";

interface SettingsEmptyStateProps {
  query: string;
  onClearQuery: () => void;
  onSelectSuggested?: (sectionId: SettingsSectionId) => void;
}

export function SettingsEmptyState({
  query,
  onClearQuery,
  onSelectSuggested,
}: SettingsEmptyStateProps) {
  const suggested: { id: SettingsSectionId; label: string }[] = [
    { id: "profile", label: "My Profile" },
    { id: "organization", label: "Organization" },
    { id: "security", label: "Security" },
    { id: "crm-config", label: "CRM Configuration" },
  ];

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 px-6 py-16 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground shadow-sm">
        <Search className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        No settings found for &ldquo;{query}&rdquo;
      </h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
        Check for typos or try searching with different keywords like &quot;password&quot;, &quot;theme&quot;, &quot;pipeline&quot;, or &quot;api&quot;.
      </p>

      <div className="mt-5 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClearQuery} className="h-8 gap-1.5 text-xs">
          <X className="h-3.5 w-3.5" /> Clear search
        </Button>
      </div>

      {onSelectSuggested && (
        <div className="mt-6 border-t border-border/60 pt-4 w-full max-w-xs">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Popular settings
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {suggested.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSuggested(s.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
