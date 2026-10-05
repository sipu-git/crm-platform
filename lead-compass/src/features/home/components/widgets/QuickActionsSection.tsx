import React, { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Deal } from "@/features/deals/deal.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ActivityFormDialog = lazy(() =>
  import("@/features/activities/components/ActivityFormModal").then((module) => ({
    default: module.ActivityFormDialog,
  })),
);

export const QuickActionsSection = React.memo(function QuickActionsSection({
  tenantSlug,
  deals,
  canCreateLead,
  canManageDeals,
  canManageInvoices,
  canManageActivities,
  canManageContacts,
  canManageCompanies,
  canManageProjects,
  onNewLead,
  onNewInvoice,
}: {
  tenantSlug: string;
  deals: Deal[];
  canCreateLead: boolean;
  canManageDeals: boolean;
  canManageInvoices: boolean;
  canManageActivities: boolean;
  canManageContacts: boolean;
  canManageCompanies: boolean;
  canManageProjects: boolean;
  onNewLead: () => void;
  onNewInvoice: () => void;
}) {
  const navigate = useNavigate();
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const actions = [
    ...(canCreateLead
      ? [
          {
            label: "New lead",
            description: "Capture a new prospect",
            icon: Users,
            tone: "bg-sky-500/10 text-sky-600",
            onClick: onNewLead,
          },
        ]
      : []),
    ...(canManageDeals
      ? [
          {
            label: "Deals",
            description: "Open your sales pipeline",
            icon: BriefcaseBusiness,
            tone: "bg-violet-500/10 text-violet-600",
            onClick: () => navigate(`/${tenantSlug}/deals`),
          },
        ]
      : []),
    ...(canManageActivities
      ? [
          {
            label: "New task",
            description: "Add a task to a deal",
            icon: CheckSquare,
            tone: "bg-emerald-500/10 text-emerald-600",
            onClick: () => setTaskPickerOpen(true),
          },
        ]
      : []),
    {
      label: "Calendar",
      description: "Review today's schedule",
      icon: CalendarDays,
      tone: "bg-amber-500/10 text-amber-600",
      onClick: () => navigate(`/${tenantSlug}/calendar`),
    },
    ...(canManageInvoices
      ? [
          {
            label: "Create invoice",
            description: "Start a new billing record",
            icon: FileText,
            tone: "bg-rose-500/10 text-rose-600",
            onClick: onNewInvoice,
          },
        ]
      : []),
  ];

  const selectedLead = selectedDeal?.leads as
    { companyId?: string | null; company?: { id?: string } | null } | null | undefined;
  const selectedCompanyId = selectedLead?.companyId ?? selectedLead?.company?.id ?? "";
  const hasMoreActions = canManageContacts || canManageCompanies || canManageProjects;

  return (
    <section aria-labelledby="quick-actions-title">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 id="quick-actions-title" className="text-sm font-semibold">
            Quick actions
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Get straight to the work you do most.
          </p>
        </div>
        {hasMoreActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground"
              >
                More actions <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>More in your workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canManageContacts && (
                <DropdownMenuItem onSelect={() => navigate(`/${tenantSlug}/contacts`)}>
                  <Users className="mr-2 h-4 w-4" /> Contacts
                </DropdownMenuItem>
              )}
              {canManageCompanies && (
                <DropdownMenuItem onSelect={() => navigate(`/${tenantSlug}/companies`)}>
                  <Building2 className="mr-2 h-4 w-4" /> Companies
                </DropdownMenuItem>
              )}
              {canManageProjects && (
                <DropdownMenuItem onSelect={() => navigate(`/${tenantSlug}/projects`)}>
                  <BriefcaseBusiness className="mr-2 h-4 w-4" /> Projects
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className="group flex min-h-24 items-center gap-3 rounded-2xl border border-border/70 bg-card px-3.5 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:min-h-28 sm:flex-col sm:items-start sm:justify-between"
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${action.tone}`}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 sm:w-full">
                <span className="block truncate text-sm font-semibold group-hover:text-primary">
                  {action.label}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {action.description}
                </span>
              </span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 sm:hidden" />
            </button>
          );
        })}
      </div>

      <Dialog open={taskPickerOpen} onOpenChange={setTaskPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose a deal for this task</DialogTitle>
            <DialogDescription>
              Tasks are attached to a deal so the follow-up stays with the customer record.
            </DialogDescription>
          </DialogHeader>
          {deals.length ? (
            <Select
              onValueChange={(id) => {
                const deal = deals.find((item) => item.id === id) ?? null;
                setSelectedDeal(deal);
                setTaskPickerOpen(false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a deal" />
              </SelectTrigger>
              <SelectContent>
                {deals.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="rounded-xl border border-dashed p-5 text-center">
              <p className="text-sm font-medium">No deals available</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create or qualify a lead to start a deal first.
              </p>
              <Button className="mt-3" size="sm" onClick={() => navigate(`/${tenantSlug}/leads`)}>
                Open leads
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {selectedDeal && (
        <Suspense fallback={null}>
          <ActivityFormDialog
            open
            onOpenChange={(open) => {
              if (!open) setSelectedDeal(null);
            }}
            dealId={selectedDeal.id}
            contactId={selectedDeal.contact_id || selectedDeal.contact?.id || ""}
            companyId={selectedCompanyId}
            defaultType="TASK"
          />
        </Suspense>
      )}
    </section>
  );
});
