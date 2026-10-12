import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SettingsSearch } from "./SettingsSearch";
import { SETTINGS_GROUPS, SETTINGS_SECTIONS } from "../config/settings-nav.config";
import type { SettingsSectionConfig, SettingsSectionId } from "../types/settings.types";

interface SettingsSidebarProps {
  activeId: SettingsSectionId;
  onSelectSection: (id: SettingsSectionId) => void;
  query: string;
  onQueryChange: (q: string) => void;
  className?: string;
}

export const SettingsSidebar = React.memo(function SettingsSidebar({
  activeId,
  onSelectSection,
  query,
  onQueryChange,
  className = "",
}: SettingsSidebarProps) {
  // Filter sections based on query (label, description, or search keywords)
  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    return SETTINGS_SECTIONS.filter((s) => {
      const matchLabel = s.label.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchKeywords = s.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchLabel || matchDesc || matchKeywords;
    });
  }, [query]);

  // Group sections by category
  const groupedSections = useMemo(() => {
    if (filteredSections) {
      return [{ group: "Search Results", items: filteredSections }];
    }

    return SETTINGS_GROUPS.map((g) => ({
      group: g,
      items: SETTINGS_SECTIONS.filter((s) => s.group === g),
    }));
  }, [filteredSections]);

  return (
    <aside
      className={`flex w-72 shrink-0 flex-col overflow-hidden border-r border-border/80 bg-card/50 ${className}`}
      aria-label="Settings navigation"
    >
      {/* Search Header */}
      <div className="border-b border-border/70 p-3">
        <SettingsSearch query={query} onQueryChange={onQueryChange} />
        {filteredSections && (
          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
            <span>{filteredSections.length} matching sections</span>
          </div>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 max-h-[calc(100vh-220px)] overflow-y-auto p-2 scrollbar-hide space-y-4">
        {groupedSections.map(({ group, items }) => {
          if (items.length === 0) return null;

          return (
            <div key={group} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {group}
              </p>

              <div className="space-y-0.5 pt-1">
                {items.map((s: SettingsSectionConfig) => {
                  const Icon = s.icon;
                  const isActive = s.id === activeId;
                  const isDanger = s.id === "danger";

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onSelectSection(s.id)}
                      className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold shadow-xs"
                          : isDanger
                            ? "text-destructive hover:bg-destructive/10"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-primary"
                            : isDanger
                              ? "text-destructive"
                              : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      />

                      <span className="flex-1 truncate">{s.label}</span>

                      {s.badge && !isActive && (
                        <Badge
                          variant={s.badgeVariant ?? "outline"}
                          className="h-4 px-1.5 text-[9px] font-semibold tracking-tight uppercase"
                        >
                          {s.badge}
                        </Badge>
                      )}

                      {isActive && (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
});

