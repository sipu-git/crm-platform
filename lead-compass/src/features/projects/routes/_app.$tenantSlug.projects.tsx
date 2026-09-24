import { FolderKanban, CalendarDays, Plus, ArrowRight } from "lucide-react";
import { EmptyState, PageHeader, TableSkeleton } from "@/components/ui-kit";
import { Badge } from "@/components/ui/badge";
import { useClientProjects } from "@/features/projects/hooks/useClientProjects";
import { ProjectDetailModal } from "@/features/projects/components/ProjectDetailModal";
import { KpiCard } from "@/features/dashboard/components/widgets/KpiGridWidget";
import { Button } from "@/components/ui/button";
import { ProjectFormModal } from "@/features/projects/components/ProjectFormModal";
import { useState, useMemo } from "react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  ON_HOLD: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function ProjectsPage() {
  const auth = useAuthPayload()
  const isClient = auth?.user.role === "CLIENT";
  const ownProjects = useClientProjects(undefined, isClient);
  const allProjects = useProjects(undefined, !isClient);

  const { data: projects = [], isLoading, isError } = isClient ? ownProjects : allProjects;

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const stats = useMemo(() => {
    if (!projects.length) return null;
    const active = projects.filter(p => p.status === 'IN_PROGRESS').length;
    const completed = projects.filter(p => p.status === 'COMPLETED').length;
    const budget = projects.reduce((acc, p) => acc + (Number(p.enquiry?.budget) || 0), 0);
    return { total: projects.length, active, completed, budget };
  }, [projects]);

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        title="Projects Workspace"
        description="Monitor active engagements and track delivery progress in real-time."
        actions={isClient && (
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
            <Plus className="h-4 w-4" />
            New Project Request
          </Button>
        )}
      />

      <div className="px-6 space-y-8">
        {isLoading ? (
          <TableSkeleton rows={4} cols={3} />
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">Could not load your projects. Please try again.</p>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-12 w-12 text-muted-foreground/50" />}
            title="No active projects"
            description="Your active and completed work will appear here once initiated."
          />
        ) : (
          <>
            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                metric={{
                  id: "total",
                  label: "Total Projects",
                  value: stats?.total ?? 0,
                  formattedValue: String(stats?.total ?? 0),
                  iconName: "Briefcase",
                }}
              />
              <KpiCard
                metric={{
                  id: "active",
                  label: "Active",
                  value: stats?.active ?? 0,
                  formattedValue: String(stats?.active ?? 0),
                  iconName: "Zap",
                }}
              />
              <KpiCard
                metric={{
                  id: "completed",
                  label: "Completed",
                  value: stats?.completed ?? 0,
                  formattedValue: String(stats?.completed ?? 0),
                  iconName: "CheckCircle2",
                }}
              />
              <KpiCard
                metric={{
                  id: "budget",
                  label: "Total Value",
                  value: stats?.budget ?? 0,
                  formattedValue: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats?.budget || 0),
                  iconName: "DollarSign",
                }}
              />
            </div>

            {/* Project Grid */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const statusStyle = statusColors[project.status] || "bg-secondary text-secondary-foreground";
                return (
                  <section
                    key={project.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProjectId(project.id)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedProjectId(project.id)}
                    className="group relative flex flex-col rounded-xl border border-white/5 bg-card backdrop-blur-md 
                    p-5 shadow-sm transition-all hover:border-indigo-500/30 hover:shadow-indigo-500/5 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="min-w-0">
                        <Badge className={`mb-3 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border ${statusStyle}`}>
                          {(project.status ?? "UNKNOWN").replace("_", " ")}
                        </Badge>
                        <h2 className="truncate text-lg font-semibold tracking-tight text-foreground group-hover:text-indigo-400 transition-colors">
                          {project?.enquiry?.project_name}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground truncate">
                          {project?.enquiry?.project_type || "Project delivery"}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-full bg-white/5 p-2 text-muted-foreground transition-colors group-hover:bg-indigo-500/10 group-hover:text-indigo-400">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>{project?.enquiry?.timeline || "No timeline"}</span>
                        </div>
                        {project?.enquiry?.budget && (
                          <div className="font-medium text-foreground">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(project.enquiry.budget))}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ProjectDetailModal
        projectId={selectedProjectId}
        open={selectedProjectId !== null}
        onOpenChange={(open) => !open && setSelectedProjectId(null)}
        onEdit={() => setSelectedProjectId(null)}
      />
      <ProjectFormModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}