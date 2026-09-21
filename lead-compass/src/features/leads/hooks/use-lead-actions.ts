import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Lead, LeadStatus, Source } from "@/features/leads/types/lead.types";
import { useDeleteLead, useUpdateLead, useUpdateLeadStatus, useConvertLead } from "@/features/leads/hooks/useLeads";

export function useLeadActions(lead: Lead | null, tenantSlug: string) {
    const navigate = useNavigate();
    
    const { mutateAsync: updateStatus, isPending: isStatusSaving } = useUpdateLeadStatus();
    const { mutateAsync: updateLead, isPending: isLeadSaving } = useUpdateLead();
    const { mutateAsync: removeLead, isPending: isDeleting } = useDeleteLead();
    const { mutateAsync: convertLead, isPending: isConverting } = useConvertLead();

    const handleStatusChange = useCallback(async (v: string) => {
        if (!lead) return;
        try {
            await updateStatus({ id: lead.id, status: v as LeadStatus });
            toast.success(`Moved to ${v.charAt(0) + v.slice(1).toLowerCase()}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Something went wrong");
        }
    }, [lead, updateStatus]);

    const handleSourceChange = useCallback(async (v: string) => {
        if (!lead) return;
        try {
            await updateLead({ id: lead.id, data: { source: v as Source } });
            toast.success("Source updated");
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Something went wrong");
        }
    }, [lead, updateLead]);

    const handleDelete = useCallback(async () => {
        if (!lead) return;
        try {
            await removeLead(lead.id);
            toast.success("Lead deleted");
            navigate(`/${tenantSlug}/leads`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Failed to delete lead");
        }
    }, [lead, removeLead, navigate, tenantSlug]);

    const handleConvert = useCallback(async () => {
        if (!lead) return;
        try {
            const res = await convertLead(lead.id);
            if (res && res.isNewClient === false) {
                toast.success("Lead converted and linked to existing client");
            } else {
                toast.success("Lead converted to client");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Failed to convert lead");
        }
    }, [lead, convertLead]);

    return { 
        statusSaving: isStatusSaving || isLeadSaving, 
        isDeleting, 
        isConverting,
        handleStatusChange, 
        handleSourceChange, 
        handleDelete,
        handleConvert
    };
}