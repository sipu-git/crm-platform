import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Phone, UserCog, ThumbsDown, Trash2, Zap, ArrowRight, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { STATUS_META } from "@/features/leads/components/status-meta";
import { LEAD_STATUS_COLORS, LeadStatus } from "@/features/leads/types/lead.types";

export function LeadDetailHeader({
    tenantSlug, leadId, fullName, companyName, status, hasAssignee,
    timeInStage, nextStage, saving, canConvert,
    onAdvanceStage, onDisqualify, onAssignClick, onDeleteClick, onConvertClick, onScheduleMeetingClick,
}: {
    tenantSlug: string;
    leadId: string;
    fullName: string;
    companyName?: string | null;
    status: LeadStatus;
    hasAssignee: boolean;
    timeInStage: string | null;
    nextStage: LeadStatus | null;
    saving: boolean;
    canConvert?: boolean;
    onAdvanceStage: (stage: LeadStatus) => void;
    onDisqualify: () => void;
    onAssignClick: () => void;
    onDeleteClick: () => void;
    onConvertClick?: () => void;
    onScheduleMeetingClick?: () => void;
}) {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 border-b bg-card">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(`/${tenantSlug}/leads`)} data-testid="back-btn">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="truncate text-base font-semibold leading-tight">{fullName || "Lead Details"}</h1>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">{companyName || "No company"}</span>
                            <span aria-hidden>•</span>
                            <StatusBadge status={status} />
                            {timeInStage && (
                                <>
                                    <span aria-hidden>•</span>
                                    <span className="hidden items-center gap-1 sm:inline-flex">
                                        <Clock className="h-3 w-3" />
                                        {timeInStage} in stage
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {status === "QUALIFIED" && canConvert && onConvertClick && (
                         <Button
                             size="sm"
                             onClick={onConvertClick}
                             disabled={saving}
                             className="hidden sm:inline-flex bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900"
                             data-testid="convert-to-client-btn"
                         >
                             <UserCog className="mr-1.5 h-3.5 w-3.5" />
                             Convert to Client
                         </Button>
                    )}
                    {nextStage && status !== "QUALIFIED" && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    onClick={() => onAdvanceStage(nextStage)}
                                    disabled={saving}
                                    className="hidden sm:inline-flex"
                                    style={{ backgroundColor: LEAD_STATUS_COLORS[nextStage], color: "#fff" }}
                                    data-testid="quick-advance-btn"
                                >
                                    <Zap className="mr-1.5 h-3.5 w-3.5" />
                                    {STATUS_META[status].nextLabel}
                                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{STATUS_META[nextStage].tip}</TooltipContent>
                        </Tooltip>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="more-menu-btn">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => navigate(`/${tenantSlug}/communications/${leadId}`)}>
                                <Phone className="mr-2 h-4 w-4" /> Contact
                            </DropdownMenuItem>
                            {onScheduleMeetingClick && (
                                <DropdownMenuItem onClick={onScheduleMeetingClick}>
                                    <Calendar className="mr-2 h-4 w-4" /> Schedule Meeting
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={onAssignClick}>
                                <UserCog className="mr-2 h-4 w-4" /> {hasAssignee ? "Reassign" : "Assign"}
                            </DropdownMenuItem>
                            {status === "QUALIFIED" && canConvert && onConvertClick && (
                                <DropdownMenuItem onClick={onConvertClick} className="sm:hidden font-semibold">
                                    Convert to Client
                                </DropdownMenuItem>
                            )}
                            {status !== "DISQUALIFIED" && status !== "CONVERTED" && (
                                <DropdownMenuItem onClick={onDisqualify} className="text-destructive focus:text-destructive" data-testid="disqualify-menu-item">
                                    <ThumbsDown className="mr-2 h-4 w-4" /> Disqualify
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onDeleteClick} className="text-destructive focus:text-destructive" data-testid="delete-menu-item">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}