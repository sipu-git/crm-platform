import { Wallet, Building2, User, Pencil, Loader2, Mail, Phone, Globe, Briefcase, Sparkles, Calendar } from "lucide-react";
import {Dialog,DialogContent,DialogHeader,DialogTitle} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useClientProjectById } from "@/features/projects/hooks/useClientProjects";
import { useProjectById } from "@/features/projects/hooks/useProjects";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";
import { ProjectStatus } from "@/features/projects/types/projects.types";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "outline" | "destructive"> = {
    IN_PROGRESS: "default",
    NOT_STARTED: "secondary",
    ON_HOLD: "outline",
    COMPLETED: "secondary",
    CANCELLED: "destructive",
};

function formatDate(value: string | null) {
    if (!value) return "Not set";
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatBudget(value: number | null) {
    if (value == null) return "Not set";
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

interface ProjectDetailModalProps {
    projectId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (projectId: string) => void;
}

// Small stat block reused for the top metrics row.
function Stat({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 px-3.5 py-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="truncate text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

export function ProjectDetailModal({ projectId, open, onOpenChange, onEdit }: ProjectDetailModalProps) {
    const auth = useAuthPayload()
    const admin = useProjectById(projectId ?? "");
    const isClientRole = auth?.user.role === "CLIENT";
    const client = useClientProjectById(projectId);
    const { data: project, isLoading, isError } = isClientRole ? client : admin;

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
                    <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading project details…
                    </div>
                </DialogContent>

            </Dialog>
        );
    }

    if (isError) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
                    <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
                        Error loading project.
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
    if (!project) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
                    <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
                        Project not found.
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
                    {/* Header */}
                    <DialogHeader className="shrink-0 border-b px-6 py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2.5">
                                    <DialogTitle className="truncate text-lg">{project.enquiry?.project_name}</DialogTitle>
                                    <Badge variant={statusVariant[project.status] ?? "secondary"}>
                                        {project?.status?.replaceAll("_", " ")}
                                    </Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {project.enquiry?.project_type || "Project delivery"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onEdit(project.id)}
                                className="flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        </div>
                    </DialogHeader>

                    {/* Body: landscape two-column grid */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                        {project.enquiry?.description ? (
                            <p className="mb-5 text-sm text-muted-foreground">{project.enquiry?.description}</p>
                        ) : null}

                        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-[1.1fr_1fr]">
                            {/* Left column: core project metrics */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Stat icon={Calendar} label="timeline" value={project.enquiry?.timeline} />
                                    <Stat icon={Wallet} label="Budget" value={formatBudget(project.enquiry?.budget)} />
                                    <Stat
                                        icon={Sparkles}
                                        label="Status"
                                        value={project?.status?.replaceAll("_", " ") ?? "Not set"}
                                    />
                                </div>

                                <div className="rounded-lg border px-3.5 py-3 text-xs text-muted-foreground">
                                    <div className="flex items-center justify-between">
                                        <span>Created</span>
                                        <span className="font-medium text-foreground">{formatDate(project.created_at)}</span>
                                    </div>
                                    <div className="mt-1.5 flex items-center justify-between">
                                        <span>Last updated</span>
                                        <span className="font-medium text-foreground">{formatDate(project.updated_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right column: relationships — company, contact, lead */}
                            <div className="space-y-3">
                                {project.company ? (
                                    <div className="rounded-lg border p-3.5">
                                        <div className="flex items-start gap-2.5">
                                            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-muted-foreground">Company</p>
                                                <p className="truncate text-sm font-medium">{project.company.name}</p>
                                                {isClientRole ? (
                                                    <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                                                        {project.company.industry ? (
                                                            <p className="flex items-center gap-1.5 truncate">
                                                                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                                                                {project.company.industry}
                                                            </p>
                                                        ) : null}
                                                        {project.company.website ? (
                                                            <p className="flex items-center gap-1.5 truncate">
                                                                <Globe className="h-3.5 w-3.5 shrink-0" />
                                                                {project.company.website}
                                                            </p>
                                                        ) : null}
                                                        {project.company.email ? (
                                                            <p className="flex items-center gap-1.5 truncate">
                                                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                                                {project.company.email}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {project.contacts ? (
                                    <div className="rounded-lg border p-3.5">
                                        <div className="flex items-start gap-2.5">
                                            <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-muted-foreground">Primary contact</p>
                                                <p className="truncate text-sm font-medium">
                                                    {project.contacts.first_name} {project.contacts.last_name}
                                                </p>
                                                {isClientRole ? (
                                                    <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                                                        {project.contacts.designation ? (
                                                            <p className="truncate">{project.contacts.designation}</p>
                                                        ) : null}
                                                        {project.contacts.email ? (
                                                            <p className="flex items-center gap-1.5 truncate">
                                                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                                                {project.contacts.email}
                                                            </p>
                                                        ) : null}
                                                        {project.contacts.phone ? (
                                                            <p className="flex items-center gap-1.5 truncate">
                                                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                                                {project.contacts.phone}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {isClientRole && project.originatingLead ? (
                                    <div className="rounded-lg border p-3.5">
                                        <div className="flex items-start gap-2.5">
                                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-muted-foreground">Originated from lead</p>
                                                <p className="truncate text-sm font-medium">
                                                    {project.originatingLead.project_name}
                                                </p>
                                                <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                                                    <p>Source: {project.originatingLead.source?.replaceAll("_", " ")}</p>
                                                    <p>Status: {project.originatingLead.status?.replaceAll("_", " ")}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >
        </>
    );
}