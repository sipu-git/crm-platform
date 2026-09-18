import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CommunicationStatus } from "@/features/communications/communication.types";

const STATUS_MAP: Partial<Record<CommunicationStatus, { node: React.ReactNode; label: string }>> = {
    FAILED: { node: <AlertCircle className="h-3 w-3 text-destructive" />, label: "Failed to send" },
    QUEUED: { node: <Clock className="h-3 w-3 opacity-70" />, label: "Queued" },
    SENT: { node: <Check className="h-3 w-3 opacity-70" />, label: "Sent" },
    DELIVERED: { node: <CheckCheck className="h-3 w-3 opacity-70" />, label: "Delivered" },
    READ: { node: <CheckCheck className="h-3 w-3 text-emerald-400" />, label: "Read" },
};

export function StatusTicks({ status }: { status: CommunicationStatus }) {
    const entry = STATUS_MAP[status];
    if (!entry) return null;
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex items-center">{entry.node}</span>
            </TooltipTrigger>
            <TooltipContent side="top">{entry.label}</TooltipContent>
        </Tooltip>
    );
}