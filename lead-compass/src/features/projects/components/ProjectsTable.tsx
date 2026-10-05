import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project } from "@/features/projects/types/projects.types";

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  ON_HOLD: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface ProjectsTableProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

export function ProjectsTable({ projects, onSelectProject }: ProjectsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="max-h-[65vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 min-w-[260px] w-[45%]">Project</TableHead>
              <TableHead className="h-11 min-w-[140px] w-[20%]">Status</TableHead>
              <TableHead className="h-11 min-w-[180px] w-[20%]">Timeline</TableHead>
              <TableHead className="h-11 min-w-[130px] w-[15%] text-right">Budget</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const statusStyle =
                statusColors[project.status] ?? "bg-secondary text-secondary-foreground";
              const budget = project.enquiry?.budget;

              return (
                <TableRow
                  key={project.id}
                  tabIndex={0}
                  aria-label={`View ${project.enquiry?.project_name || "project"}`}
                  onClick={() => onSelectProject(project.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectProject(project.id);
                    }
                  }}
                  className="group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                >
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground transition-colors group-hover:text-indigo-400">
                        {project.enquiry?.project_name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {project.enquiry?.project_type || "Project delivery"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyle}`}
                    >
                      {(project.status ?? "UNKNOWN").replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      <span className="truncate">{project.enquiry?.timeline || "No timeline"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {budget ? (
                      currencyFormatter.format(Number(budget))
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
