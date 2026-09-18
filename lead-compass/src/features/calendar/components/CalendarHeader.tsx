import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  Calendar as CalendarIcon,
  List,
} from "lucide-react";
import { format } from "date-fns";

interface CalendarHeaderProps {
  currentDate: Date;
  onNavigateMonth: (delta: number) => void;
  onToday: () => void;
  viewMode: "month" | "agenda";
  onViewModeChange: (mode: "month" | "agenda") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  onNewEvent: () => void;
  isRefreshing?: boolean;
}

export function CalendarHeader({
  currentDate,
  onNavigateMonth,
  onToday,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  onNewEvent,
  isRefreshing,
}: CalendarHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Date Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <div className="flex items-center rounded-md border bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={() => onNavigateMonth(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={() => onNavigateMonth(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground ml-2">
          {format(currentDate, "MMMM yyyy")}
        </h2>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center rounded-md border bg-muted p-0.5">
          <button
            onClick={() => onViewModeChange("month")}
            className={`flex items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode === "month"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" /> Month
          </button>
          <button
            onClick={() => onViewModeChange("agenda")}
            className={`flex items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode === "agenda"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" /> Agenda
          </button>
        </div>

        {/* Refresh */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Events"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>

        {/* Add Event Button */}
        <Button size="sm" onClick={onNewEvent} className="gap-1.5 font-semibold">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>
    </div>
  );
}

