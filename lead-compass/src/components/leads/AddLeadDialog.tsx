// features/leads/components/AddLeadDialog.tsx
import { useState } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import type { CreateLeadInput } from "@/features/leads/service1/lead.types";
import { LEAD_SOURCES } from "@/features/leads/service1/lead.types";
import { validateLead, type LeadFormErrors } from "@/features/leads/service1/lead.validates";
import { leadValidationMessages as msg } from "@/features/leads/service1/lead.validate-messages";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addLead } from "@/features/leads/service1/slice";

const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500";

function Field({ label, error, children }: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium tracking-wide text-slate-500">
        {label.toUpperCase()}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const emptyDraft = (): Partial<CreateLeadInput> => ({
  first_name: "",
  last_name: "",
  designation: "",
  project_name: "",
  project_type: "",
  company_name: "",
  email: "",
  phone: "",
  source: LEAD_SOURCES[0],
});

export function AddLeadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState<Partial<CreateLeadInput>>(emptyDraft());
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof CreateLeadInput>(key: K, value: CreateLeadInput[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const reset = () => {
    setDraft(emptyDraft());
    setErrors({});
  };

  const handleCreate = async () => {
    const { success, errors: validationErrors } = validateLead(draft);
    if (!success) {
      setErrors(validationErrors);
      toast.error(msg.form.incomplete);
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(addLead(draft as CreateLeadInput)).unwrap();
      toast.success("Lead created");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" error={errors.first_name}>
              <input
                className={inputClass}
                value={draft.first_name ?? ""}
                onChange={(e) => update("first_name", e.target.value)}
                placeholder="Priya"
              />
            </Field>
            <Field label="Last name" error={errors.last_name}>
              <input
                className={inputClass}
                value={draft.last_name ?? ""}
                onChange={(e) => update("last_name", e.target.value)}
                placeholder="Sharma"
              />
            </Field>
            <Field label="Designation" error={errors.designation}>
              <input
                className={inputClass}
                value={draft.designation ?? ""}
                onChange={(e) => update("designation", e.target.value)}
                placeholder="VP of Sales"
              />
            </Field>

            <Field label="Company name" error={errors.company_name}>
              <input
                className={inputClass}
                value={draft.company_name ?? ""}
                onChange={(e) => update("company_name", e.target.value)}
                placeholder="Acme Inc."
              />
            </Field>

          </div>

          <Field label="Project Name" error={errors.company_name}>
            <input
              className={inputClass}
              value={draft.project_name ?? ""}
              onChange={(e) => update("project_name", e.target.value)}
              placeholder="e-gravience ecommerce platform"
            />
          </Field>
          <Field label="Project Type" error={errors.company_name}>
            <input
              className={inputClass}
              value={draft.project_type ?? ""}
              onChange={(e) => update("project_type", e.target.value)}
              placeholder="e-commerce"
            />
          </Field>
          {/* <Field label="Owner name" error={errors.owner_name}>
            <input
              className={inputClass}
              value={draft.owner_name ?? ""}
              onChange={(e) => update("owner_name", e.target.value)}
              placeholder="Who owns this relationship at their end"
            />
          </Field> */}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" error={errors.email}>
              <input
                type="email"
                className={inputClass}
                value={draft.email ?? ""}
                onChange={(e) => update("email", e.target.value)}
                placeholder="priya@example.com"
              />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input
                className={inputClass}
                value={draft.phone ?? ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+1 555 010 2030"
              />
            </Field>
          </div>

          <Field label="Source" error={errors.source}>
            <Select
              value={draft.source ?? LEAD_SOURCES[0]}
              onValueChange={(v) => update("source", v as CreateLeadInput["source"])}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? "Creating..." : "Create lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}