// src/features/search/DebouceSearch.tsx
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Loader2, X, Target, Briefcase, Receipt, Building2, Mail, User, ArrowRight, Hash, } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Input } from "@/components/ui/input";
import {
  performSearch,
  setQuery,
  clearSearch,
  selectSearchQuery,
  selectSearchResults,
  selectSearchStatus,
} from "@/features/global-apis/slice";
import { useDebounceHook } from "@/hooks/use-debouce";
import { cn } from "@/lib/utils";

const MIN_QUERY_LENGTH = 2;

type FilterTab = "all" | "leads" | "deals" | "invoices";

export function HeaderSearch() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tenantSlug = "" } = useParams();

  const query = useAppSelector(selectSearchQuery);
  const results = useAppSelector(selectSearchResults);
  const status = useAppSelector(selectSearchStatus);

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounceHook(query, 300);

  // fire the search once the debounced value settles
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    dispatch(performSearch({ query: trimmed, limit: 10 }));
  }, [debouncedQuery, dispatch]);

  // open/close the dropdown based on query length
  useEffect(() => {
    setOpen(query.trim().length >= MIN_QUERY_LENGTH);
    setSelectedIndex(-1);
  }, [query]);

  // close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const leads = results.leads || [];
  const deals = results.deals || [];
  const invoices = results.invoices || [];

  const totalCount = leads.length + deals.length + invoices.length;

  // Flatten items for active tab to enable keyboard navigation
  const visibleItems = useMemo(() => {
    const items: Array<{ id: string; type: "lead" | "deal" | "invoice"; url: string; data: any }> = [];
    if (activeTab === "all" || activeTab === "leads") {
      leads.forEach((l) => items.push({ id: l.id, type: "lead", url: `lead/${l.id}`, data: l }));
    }
    if (activeTab === "all" || activeTab === "deals") {
      deals.forEach((d) => items.push({ id: d.id, type: "deal", url: `deals/${d.id}`, data: d }));
    }
    if (activeTab === "all" || activeTab === "invoices") {
      invoices.forEach((i) => items.push({ id: i.id, type: "invoice", url: `invoices/${i.id}`, data: i }));
    }
    return items;
  }, [activeTab, leads, deals, invoices]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isShortcut) {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (!open) return;

      if (e.key === "Escape") {
        inputRef.current?.blur();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < visibleItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : visibleItems.length - 1));
      } else if (e.key === "Enter" && selectedIndex >= 0 && visibleItems[selectedIndex]) {
        e.preventDefault();
        goTo(visibleItems[selectedIndex].url);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, visibleItems, selectedIndex]);

  function handleClear() {
    dispatch(clearSearch());
    setOpen(false);
  }

  function goTo(path: string) {
    navigate(`/${tenantSlug}/${path}`);
    handleClear();
  }

  const hasAnyResults = totalCount > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative">
        {/* <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /> */}
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => dispatch(setQuery(e.target.value))}
          onFocus={() => query.trim().length >= MIN_QUERY_LENGTH && setOpen(true)}
          placeholder="Search leads, contacts, deals, invoices, GSTIN..."
          className="w-full h-9 bg-background/60 backdrop-blur-sm border-sidebar-border focus-visible:ring-1 focus-visible:ring-primary"
        />
        {query ? (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden select-none rounded
           bg-ring px-1.5 py-1 text-[10px] font-medium text-accent sm:inline-block">
            ⌘
          </kbd>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[340px] sm:min-w-[440px] rounded-xl border bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Header Tabs */}
          {hasAnyResults && (
            <div className="flex items-center gap-1 border-b bg-muted/40 px-2 py-1.5 text-xs">
              <button
                type="button"
                onClick={() => { setActiveTab("all"); setSelectedIndex(-1); }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors",
                  activeTab === "all"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span>All</span>
                <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px]">{totalCount}</span>
              </button>
              {leads.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setActiveTab("leads"); setSelectedIndex(-1); }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors",
                    activeTab === "leads"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Target className="h-3 w-3 text-blue-500" />
                  <span>Leads</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px]">{leads.length}</span>
                </button>
              )}
              {deals.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setActiveTab("deals"); setSelectedIndex(-1); }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors",
                    activeTab === "deals"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Briefcase className="h-3 w-3 text-emerald-500" />
                  <span>Deals</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px]">{deals.length}</span>
                </button>
              )}
              {invoices.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setActiveTab("invoices"); setSelectedIndex(-1); }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors",
                    activeTab === "invoices"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Receipt className="h-3 w-3 text-purple-500" />
                  <span>Invoices</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px]">{invoices.length}</span>
                </button>
              )}
            </div>
          )}

          {status === "loading" && (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Searching CRM records…
            </div>
          )}

          {status === "failed" && (
            <div className="p-5 text-center text-sm text-destructive">
              Something went wrong fetching results. Try a different search term.
            </div>
          )}

          {status === "succeeded" && !hasAnyResults && (
            <div className="p-6 text-center space-y-2">
              <p className="text-sm font-medium text-foreground">No matches found for "{query}"</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Try searching by company name, project name, contact person, email, deal title, invoice number, or GSTIN.
              </p>
            </div>
          )}

          {status === "succeeded" && hasAnyResults && (
            <div className="max-h-96 overflow-y-auto divide-y divide-border/40 py-1">
              {(activeTab === "all" || activeTab === "leads") && leads.length > 0 && (
                <div className="py-1">
                  <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-blue-500" /> Leads ({leads.length})
                    </span>
                    <button
                      onClick={() => goTo("leads")}
                      className="text-[10px] text-primary hover:underline font-normal capitalize"
                    >
                      View all
                    </button>
                  </div>
                  {leads.map((l: any) => {
                    const idx = visibleItems.findIndex((vi) => vi.id === l.id && vi.type === "lead");
                    const isSelected = selectedIndex === idx;
                    const contactName = [l.contact?.first_name, l.contact?.last_name].filter(Boolean).join(" ");
                    return (
                      <button
                        key={l.id}
                        onClick={() => goTo(`lead/${l.id}`)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors",
                          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate text-xs">
                                {l.company_name || l.project_name || "Untitled Lead"}
                              </span>
                              {l.project_name && l.company_name && (
                                <span className="text-[11px] text-muted-foreground truncate">
                                  ({l.project_name})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                              {contactName && (
                                <span className="flex items-center gap-1">
                                  <User className="h-2.5 w-2.5" />
                                  {contactName}
                                </span>
                              )}
                              {l.contact?.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-2.5 w-2.5" />
                                  {l.contact.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {l.status && (
                          <span className="shrink-0 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400">
                            {l.status}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {(activeTab === "all" || activeTab === "deals") && deals.length > 0 && (
                <div className="py-1">
                  <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-emerald-500" /> Deals ({deals.length})
                    </span>
                    <button
                      onClick={() => goTo("deals")}
                      className="text-[10px] text-primary hover:underline font-normal capitalize"
                    >
                      View all
                    </button>
                  </div>
                  {deals.map((d: any) => {
                    const idx = visibleItems.findIndex((vi) => vi.id === d.id && vi.type === "deal");
                    const isSelected = selectedIndex === idx;
                    return (
                      <button
                        key={d.id}
                        onClick={() => goTo(`deals/${d.id}`)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors",
                          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Briefcase className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-foreground truncate text-xs block">
                              {d.title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                              {d.leads?.company_name && (
                                <span>{d.leads.company_name}</span>
                              )}
                              <span>₹{Number(d.amount || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        {d.pipeline?.name && (
                          <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {d.pipeline.name}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {(activeTab === "all" || activeTab === "invoices") && invoices.length > 0 && (
                <div className="py-1">
                  <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-purple-500" /> Invoices ({invoices.length})
                    </span>
                    <button
                      onClick={() => goTo("invoices")}
                      className="text-[10px] text-primary hover:underline font-normal capitalize"
                    >
                      View all
                    </button>
                  </div>
                  {invoices.map((i: any) => {
                    const idx = visibleItems.findIndex((vi) => vi.id === i.id && vi.type === "invoice");
                    const isSelected = selectedIndex === idx;
                    const gstin = i.buyer_gstin || i.company?.gst_number;
                    return (
                      <button
                        key={i.id}
                        onClick={() => goTo(`invoices/${i.id}`)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors",
                          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Receipt className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate text-xs font-mono">
                                {i.invoice_number}
                              </span>
                              <span className="text-[11px] text-muted-foreground truncate">
                                · {i.buyer_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                              <span>₹{Number(i.total_amount || 0).toLocaleString()}</span>
                              {gstin && (
                                <span className="font-mono text-[10px] bg-muted px-1 rounded">
                                  GST: {gstin}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {i.status && (
                          <span className="shrink-0 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-600 dark:text-purple-400">
                            {i.status}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer Guide */}
          <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-background px-1 py-0.2 text-[9px]">↑↓</kbd> navigate
              <kbd className="ml-1 rounded border bg-background px-1 py-0.2 text-[9px]">↵</kbd> select
              <kbd className="ml-1 rounded border bg-background px-1 py-0.2 text-[9px]">ESC</kbd> close
            </span>
            <span className="font-mono text-[10px]">ClearView Search</span>
          </div>
        </div>
      )}
    </div>
  );
}
