// CompanyProjectCard.tsx
import { FileText } from "lucide-react";
import InfoCard from "../InfoCard";
import { LEAD_FIELDS } from "@/utils/field-defs";
import { Lead } from "@/features/leads/types/lead.types";
import EditableField from "../EditableField";

export function CompanyProjectCard({
    lead, isEditing, draftValue, saving, onStartEdit, onChangeDraft, onSave, onCancel,
}: {
    lead: Lead;
    isEditing: (key: string) => boolean;
    draftValue: string;
    saving: boolean;
    onStartEdit: (type: "lead" | "contact", key: string, currentValue: string) => void;
    onChangeDraft: (v: string) => void;
    onSave: (type: "lead" | "contact", key: string) => void;
    onCancel: () => void;
}) {
    return (
        <InfoCard title="Company & project" icon={<FileText className="h-4 w-4 text-primary" />}>
            <div className="flex flex-col gap-1.5">
                {LEAD_FIELDS.map((f) => {
                    const active = isEditing(f.key);
                    return (
                        <EditableField
                            key={f.key}
                            type="lead"
                            fieldKey={f.key}
                            label={f.label}
                            icon={f.icon}
                            value={lead[f.key] as string | undefined}
                            placeholder={f.placeholder}
                            isEditing={active}
                            draftValue={active ? draftValue : ""}
                            saving={active && saving}
                            onStartEdit={onStartEdit}
                            onChangeDraft={onChangeDraft}
                            onSave={onSave}
                            onCancel={onCancel}
                        />
                    );
                })}
            </div>
        </InfoCard>
    );
}