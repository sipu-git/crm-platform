import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LeadWithActivity } from "@/features/activities/utils/activity";
import { useLeadFieldEditing } from "@/features/leads/hooks/use-lead-edit";
import { useLeadActions } from "@/features/leads/hooks/use-lead-actions";
import { PIPELINE_STAGES } from "@/features/leads/components/status-meta";
import { usePermission } from "@/features/auth/hooks/use-permission";

import { LeadHeroCard } from "@/features/leads/components/sections/LeadHeroCard";
import { CompanyProjectCard } from "@/features/leads/components/sections/CompanyProjectCard";
import { ContactInfoCard } from "@/features/leads/components/sections/ContactInfoCard";
import { LeadSourceCard } from "@/features/leads/components/sections/LeadSourceCard";
import { ActivityCard } from "@/features/leads/components/sections/ActivityCard";
import { AssigneeCard } from "@/features/leads/components/sections/AssigneeCard";
import { LeadStageGaugeCard } from "@/features/leads/components/sections/LeadStageGaugeCard";
import { LeadDetailHeader } from "@/features/leads/components/LeadDetailHeader";

import { useLead } from "@/features/leads/hooks/useLeads";
import { useAssignment } from "@/features/leads/hooks/useAssignment";
import { LeadStatus } from "@/features/leads/types/lead.types";

const AssignLeadDialog = lazy(
  () => import("@/features/leads/components/AssignLeadModal")
);

const DeleteLeadDialog = lazy(
  () => import("@/features/leads/components/DeleteLeadDialog")
);

const EventDialog = lazy(
  () => import("@/features/calendar/components/EventDialog")
);

const STATUS_COLOR: Record<LeadStatus, string> = {
  NEW: "#3B82F6",
  CONTRACTED: "#F59E0B",
  QUALIFIED: "#10B981",
  CONVERTED: "#6366F1",
  DISQUALIFIED: "#DC2626",
};

export default function LeadDetailPage() {
  const { tenantSlug = "", leadId } = useParams<{
    tenantSlug: string;
    leadId: string;
  }>();

  const {
    data: rawLead,
    isLoading: loading,
    isError,
    error,
  } = useLead(leadId);

  const lead = rawLead as LeadWithActivity | null | undefined;

  const { can } = usePermission();

  const [activeDialog, setActiveDialog] = useState<
    "assign" | "delete" | "schedule" | null
  >(null);

  const {
    data: assignees,
    isLoading: assigneesLoading,
    isError: assigneesError,
  } = useAssignment();

  const editing = useLeadFieldEditing(lead ?? null);
  const actions = useLeadActions(lead ?? null, tenantSlug);

  const fullName = useMemo(
    () =>
      [lead?.contact?.first_name, lead?.contact?.last_name]
        .filter(Boolean)
        .join(" "),
    [lead?.contact?.first_name, lead?.contact?.last_name]
  );

  const initials = useMemo(
    () =>
      [lead?.contact?.first_name, lead?.contact?.last_name]
        .map((name) => name?.trim()?.[0])
        .filter(Boolean)
        .join("")
        .toUpperCase(),
    [lead?.contact?.first_name, lead?.contact?.last_name]
  );

  const createdDate = useMemo(
    () =>
      lead?.created_At
        ? format(new Date(lead.created_At), "MMM d, yyyy")
        : null,
    [lead?.created_At]
  );

  const timeInStage = useMemo(() => {
    if (!lead) return null;

    const entered =
      lead.status_history
        ?.filter((history) => history.status === lead.status)
        .slice(-1)[0]?.changed_At ??
      lead.updated_at ??
      lead.updated_At ??
      lead.created_At;

    if (!entered) return null;

    return formatDistanceToNow(new Date(entered), {
      addSuffix: false,
    });
  }, [lead]);

  const nextStage = useMemo<LeadStatus | null>(() => {
    if (!lead || lead.status === "DISQUALIFIED") {
      return null;
    }

    const index = PIPELINE_STAGES.indexOf(lead.status);

    if (index === -1 || index === PIPELINE_STAGES.length - 1) {
      return null;
    }

    return PIPELINE_STAGES[index + 1];
  }, [lead]);

  const statusColor = STATUS_COLOR[lead?.status ?? "NEW"];

  const openAssignDialog = useCallback(() => {
    setActiveDialog("assign");
  }, []);

  const openDeleteDialog = useCallback(() => {
    setActiveDialog("delete");
  }, []);

  const openScheduleDialog = useCallback(() => {
    setActiveDialog("schedule");
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  const handleDisqualify = useCallback(() => {
    return actions.handleStatusChange("DISQUALIFIED");
  }, [actions]);

  const handleDelete = useCallback(async () => {
    await actions.handleDelete();
    setActiveDialog(null);
  }, [actions]);

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p
          role="alert"
          className="max-w-xl rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          Could not load this lead.{" "}
          {error instanceof Error
            ? error.message
            : "Please refresh and try again."}
        </p>
      </div>
    );
  }

  if (loading || !lead) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        data-testid="lead-detail-loading"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading lead details…
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className="min-h-screen bg-background"
        data-testid="lead-detail-page"
      >
        <LeadDetailHeader
          tenantSlug={tenantSlug}
          leadId={lead.id}
          fullName={fullName}
          companyName={lead.company_name}
          status={lead.status}
          hasAssignee={!!lead.assignee}
          timeInStage={timeInStage}
          nextStage={nextStage}
          saving={actions.statusSaving || actions.isConverting}
          canConvert={can("leads:convert")}
          onAdvanceStage={actions.handleStatusChange}
          onDisqualify={handleDisqualify}
          onAssignClick={openAssignDialog}
          onDeleteClick={openDeleteDialog}
          onConvertClick={actions.handleConvert}
          onScheduleMeetingClick={openScheduleDialog}
        />

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="grid items-start gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <LeadHeroCard
                fullName={fullName}
                initials={initials}
                statusColor={statusColor}
                designation={lead.contact?.designation}
                companyName={lead.company_name}
                createdDate={createdDate}
                email={lead.contact?.email}
                phone={lead.contact?.phone}
              />

              <div className="flex flex-col gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <CompanyProjectCard
                    lead={lead}
                    isEditing={editing.isLeadEditing}
                    draftValue={editing.draftValue}
                    saving={editing.saving}
                    onStartEdit={editing.handleStartEdit}
                    onChangeDraft={editing.setDraftValue}
                    onSave={editing.handleSaveField}
                    onCancel={editing.cancelEdit}
                  />

                  <ContactInfoCard
                    lead={lead}
                    isEditing={editing.isContactEditing}
                    draftValue={editing.draftValue}
                    saving={editing.saving}
                    onStartEdit={editing.handleStartEdit}
                    onChangeDraft={editing.setDraftValue}
                    onSave={editing.handleSaveField}
                    onCancel={editing.cancelEdit}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                  <LeadSourceCard
                    source={lead.source}
                    saving={actions.statusSaving}
                    onChange={actions.handleSourceChange}
                  />

                  <ActivityCard activities={lead.activities ?? []} />
                </div>
              </div>
            </div>

            <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
              <AssigneeCard
                assignee={lead.assignee}
                onAssignClick={openAssignDialog}
              />

              {assigneesError && (
                <p
                  className="text-xs text-destructive"
                  role="alert"
                >
                  Couldn't load team members. Assigning may not work until
                  this is fixed.
                </p>
              )}

              <LeadStageGaugeCard
                status={lead.status}
                saving={actions.statusSaving}
                onStatusChange={actions.handleStatusChange}
              />
            </aside>
          </div>
        </div>

        <Suspense fallback={null}>
          {activeDialog === "assign" && (
            <AssignLeadDialog
              open
              onOpenChange={(open) => {
                if (!open) closeDialog();
              }}
              leadId={lead.id}
              currentAssignee={lead.assignee}
              assignees={assignees ?? []}
              isLoading={assigneesLoading}
              isError={assigneesError}
            />
          )}

          {activeDialog === "delete" && (
            <DeleteLeadDialog
              open
              onOpenChange={(open) => {
                if (!open) closeDialog();
              }}
              fullName={fullName}
              isDeleting={actions.isDeleting}
              onConfirm={handleDelete}
            />
          )}

          {activeDialog === "schedule" && (
            <EventDialog
              open
              onOpenChange={(open) => {
                if (!open) closeDialog();
              }}
            />
          )}
        </Suspense>
      </div>
    </TooltipProvider>
  );
}