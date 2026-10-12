import { useState, useTransition, Suspense, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Menu, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui-kit";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SettingsSidebar } from "../components/SettingsSidebar";
import { SettingsBreadcrumbs } from "../components/SettingsBreadcrumbs";
import { SettingsPanelSkeleton } from "../components/SettingsPanelSkeleton";
import { SettingsErrorBoundary } from "../components/SettingsErrorBoundary";
import { SettingsEmptyState } from "../components/SettingsEmptyState";
import { SETTINGS_SECTIONS, DEFAULT_SETTINGS_SECTION_ID } from "../config/settings-nav.config";
import { getSettingsPanelComponent } from "../config/settings-panels.registry";
import type { SettingsSectionConfig, SettingsSectionId } from "../types/settings.types";

export function SettingsLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  // Read initial section from URL search params e.g. ?section=security or ?tab=security
  const initialSectionId = useMemo<SettingsSectionId>(() => {
    const param = searchParams.get("section") || searchParams.get("tab");
    if (param && SETTINGS_SECTIONS.some((s) => s.id === param)) {
      return param as SettingsSectionId;
    }
    return DEFAULT_SETTINGS_SECTION_ID;
  }, [searchParams]);

  const [activeId, setActiveId] = useState<SettingsSectionId>(initialSectionId);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync state if URL search params change externally
  useEffect(() => {
    const param = searchParams.get("section") || searchParams.get("tab");
    if (param && SETTINGS_SECTIONS.some((s) => s.id === param)) {
      setActiveId(param as SettingsSectionId);
    }
  }, [searchParams]);

  // Active section metadata config
  const activeSection = useMemo<SettingsSectionConfig>(() => {
    return SETTINGS_SECTIONS.find((s) => s.id === activeId) ?? SETTINGS_SECTIONS[0];
  }, [activeId]);

  // Handle switching active section with transition & URL parameter sync
  const handleSelectSection = useCallback((id: SettingsSectionId) => {
    startTransition(() => {
      setActiveId(id);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("section", id);
        return next;
      }, { replace: true });
    });
    setMobileOpen(false);
  }, [setSearchParams]);

  // Check if search query matches any section
  const hasSearchResults = useMemo(() => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return SETTINGS_SECTIONS.some(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.keywords?.some((k) => k.toLowerCase().includes(q)),
    );
  }, [query]);

  // Retrieve code-split lazy panel component for active section
  const PanelComponent = useMemo(() => {
    return getSettingsPanelComponent(activeId);
  }, [activeId]);

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="Settings"
        description="Manage your profile, team permissions, integrations, and CRM configuration."
        actions={
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <Menu className="h-4 w-4" />
                  <span>Sections ({activeSection.label})</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="border-b p-4 text-left">
                  <SheetTitle className="flex items-center gap-2 text-base font-semibold">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    CRM Settings
                  </SheetTitle>
                </SheetHeader>
                <SettingsSidebar
                  activeId={activeId}
                  onSelectSection={handleSelectSection}
                  query={query}
                  onQueryChange={setQuery}
                  className="w-full border-r-0"
                />
              </SheetContent>
            </Sheet>
          </div>
        }
      />

      {/* Main Settings Card Layout */}
      <Card className="border-border/80 bg-card shadow-sm overflow-hidden">
        <CardContent className="p-0 flex min-h-[680px]">
          {/* Desktop Sidebar Navigation */}
          <SettingsSidebar
            activeId={activeId}
            onSelectSection={handleSelectSection}
            query={query}
            onQueryChange={setQuery}
            className="hidden md:flex"
          />

          {/* Main Content Area */}
          <main className="min-w-0 flex-1 p-6 md:p-8">
            {/* Breadcrumb Navigation */}
            <SettingsBreadcrumbs section={activeSection} />

            {/* Section Header */}
            <div className="mb-6 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <activeSection.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight">
                    {activeSection.label}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeSection.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Panel with Code Splitting (React.lazy + Suspense + Error Boundary) */}
            {!hasSearchResults ? (
              <SettingsEmptyState
                query={query}
                onClearQuery={() => setQuery("")}
                onSelectSuggested={handleSelectSection}
              />
            ) : (
              <SettingsErrorBoundary
                key={activeId}
                sectionLabel={activeSection.label}
                onReset={() => handleSelectSection(activeId)}
              >
                <Suspense fallback={<SettingsPanelSkeleton />}>
                  <PanelComponent />
                </Suspense>
              </SettingsErrorBoundary>
            )}
          </main>
        </CardContent>
      </Card>
    </div>
  );
}

