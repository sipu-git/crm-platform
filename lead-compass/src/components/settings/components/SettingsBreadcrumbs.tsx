import { ChevronRight, SlidersHorizontal } from "lucide-react";
import type { SettingsSectionConfig } from "../types/settings.types";

interface SettingsBreadcrumbsProps {
  section: SettingsSectionConfig;
}

export function SettingsBreadcrumbs({ section }: SettingsBreadcrumbsProps) {
  const Icon = section.icon;

  return (
    <nav
      aria-label="Settings breadcrumb"
      className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground"
    >
      <span className="flex items-center gap-1 font-medium text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Settings
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
      <span>{section.group}</span>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
      <span className="flex items-center gap-1 font-semibold text-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {section.label}
      </span>
    </nav>
  );
}

