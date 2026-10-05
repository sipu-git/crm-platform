import { FolderKanban, Plus } from "lucide-react";
import { EmptyState, PageHeader, TableSkeleton } from "@/components/ui-kit";
import { useClientProjects } from "@/features/projects/hooks/useClientProjects";
import { KpiCard } from "@/features/dashboard/components/widgets/KpiGridWidget";
import { Button } from "@/components/ui/button";
import { lazy, Suspense, useMemo, useState } from "react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import { ProjectsTable } from "@/features/projects/components/ProjectsTable";

const ProjectDetailModal = lazy(() => import("@/features/projects/components/ProjectDetailModal"));
const ProjectFormModal = lazy(() => import("@/features/projects/components/ProjectFormModal"));

export default function ProjectsPage() {
  const auth = useAuthPayload();
  const isClient = auth?.user.role === "CLIENT";
  const ownProjects = useClientProjects(undefined, isClient);
  const allProjects = useProjects(undefined, !isClient);

  const { data: projects = [], isLoading, isError } = isClient ? ownProjects : allProjects;

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const stats = useMemo(() => {
    if (!projects.length) return null;
    const active = projects.filter((p) => p.status === "IN_PROGRESS").length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const budget = projects.reduce((acc, p) => acc + (Number(p.enquiry?.budget) || 0), 0);
    return { total: projects.length, active, completed, budget };
  }, [projects]);

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        title="Projects Workspace"
        description="Monitor active engagements and track delivery progress in real-time."
        actions={
          isClient && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              New Project Request
            </Button>
          )
        }
      />

      <div className="px-6 space-y-8">
        {isLoading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">
              Could not load your projects. Please try again.
            </p>
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
                  formattedValue: new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(stats?.budget || 0),
                  iconName: "DollarSign",
                }}
              />
            </div>

            <ProjectsTable projects={projects} onSelectProject={setSelectedProjectId} />
          </>
        )}
      </div>

      <Suspense fallback={null}>
        <ProjectDetailModal
          projectId={selectedProjectId}
          open={selectedProjectId !== null}
          onOpenChange={(open) => !open && setSelectedProjectId(null)}
          onEdit={() => setSelectedProjectId(null)}
        />

        <ProjectFormModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      </Suspense>
    </div>
  );
}
