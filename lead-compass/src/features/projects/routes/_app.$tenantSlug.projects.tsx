import { FolderKanban, CalendarDays } from "lucide-react";
import { EmptyState, PageHeader, TableSkeleton } from "@/components/ui-kit";
import { Badge } from "@/components/ui/badge";
import { useClientProjects } from "@/features/projects/hooks/useClientProjects";
import { ProjectDetailModal } from "@/features/projects/components/ProjectDetailModal";
import { useState } from "react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";

export function ProjectsPage() {
  const auth = useAuthPayload()
  const isClient = auth?.user.role === "CLIENT";
  const ownProjects = useClientProjects(undefined, isClient);
  const allProjects = useProjects(undefined, !isClient);

  const { data: projects = [], isLoading, isError } = isClient ? ownProjects : allProjects;

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Projects" description="Track the work being delivered for your organization." />
      <div className="p-6">
        {isLoading ? <TableSkeleton rows={4} cols={3} /> : null}

        {isError ? (
          <p className="text-sm text-destructive">Could not load your projects. Please try again.</p>
        ) : null}

        {!isLoading && !isError && projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-6 w-6" />}
            title="No projects yet"
            description="Your active and completed work will appear here."
          />
        ) : null}

        {!isLoading && !isError && projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <section
                key={project.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProjectId(project.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedProjectId(project.id)}
                className="rounded-lg border bg-card p-4 shadow-sm cursor-pointer transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{project.enquiry.project_name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {project.enquiry.project_type || "Project delivery"}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {(project.status ?? "unknown").replaceAll("_", " ")}
                  </Badge>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {project.enquiry.timeline}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </div>
      <ProjectDetailModal
        projectId={selectedProjectId}
        open={selectedProjectId !== null}
        onOpenChange={(open) => !open && setSelectedProjectId(null)}
        onEdit={(id) => {
          // route into the same edit flow the card's pencil icon triggers
          setSelectedProjectId(null);
        }}
      />
    </div>
  );
}