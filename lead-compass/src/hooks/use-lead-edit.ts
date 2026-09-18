import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useContactMutation } from "@/features/contacts/hooks/useContacts";
import { leadsKeys } from "@/features/leads/keys/leads.keys";
import type { Lead } from "@/features/leads/types/lead.types";
import { useUpdateLead } from "@/features/leads/hooks/useLeads";

type EditingKey = { type: "lead" | "contact"; key: string } | null;

export function useLeadFieldEditing(lead: (Lead & { contact?: { id: string } | null }) | null) {
    const queryClient = useQueryClient();
    const { update: updateContact } = useContactMutation();
    
    const [editingField, setEditingField] = useState<EditingKey>(null);
    const [draftValue, setDraftValue] = useState("");
    const [saving, setSaving] = useState(false);
    const draftValueRef = useRef("");
    
    const { mutateAsync: updateLeadData } = useUpdateLead();

    useEffect(() => { draftValueRef.current = draftValue; }, [draftValue]);

    const cancelEdit = useCallback(() => {
        setEditingField(null);
        setDraftValue("");
    }, []);

    const handleStartEdit = useCallback((type: "lead" | "contact", key: string, currentValue: string) => {
        setEditingField({ type, key });
        setDraftValue(currentValue);
    }, []);

    const handleSaveField = useCallback(async (type: "lead" | "contact", key: string) => {
        if (!lead) return;
        const value = draftValueRef.current;
        setSaving(true);
        try {
            if (type === "lead") {
                await updateLeadData({ id: lead.id, data: { [key]: value } as Partial<Lead> });
                toast.success("Lead updated");
            } else if (lead.contact) {
                await updateContact.mutateAsync({ id: lead.contact.id, data: { [key]: value } });
                queryClient.invalidateQueries({ queryKey: leadsKeys.detail(lead.id) });
                toast.success("Contact updated");
            }
            cancelEdit();
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }, [lead, updateContact, updateLeadData, queryClient, cancelEdit]);

    const isLeadEditing = (k: string) => editingField?.type === "lead" && editingField.key === k;
    const isContactEditing = (k: string) => editingField?.type === "contact" && editingField.key === k;

    return {
        editingField, draftValue, saving,
        isLeadEditing, isContactEditing,
        setDraftValue, handleStartEdit, handleSaveField, cancelEdit,
    };
}
