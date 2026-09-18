import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StatusHistoryEntry } from "@/utils/activity";
import { STATUS_META, titleCase } from "@/utils/status-meta";
import { LEAD_STATUS_COLORS, LEAD_STATUSES, LeadStatus } from "@/features/leads/types/lead.types";
import { OrderStatusTimeline } from "../timlines/OrderStatusTimeline";

export function PipelineCard({
    status, statusHistory, saving, onStatusChange,
}: {
    status: LeadStatus;
    statusHistory?: StatusHistoryEntry[];
    saving: boolean;
    onStatusChange: (v: string) => void;
}) {
    const statusColor = LEAD_STATUS_COLORS[status];

    return (
        <Card className="overflow-hidden border-border/60 shadow-sm bg-card">
            <CardHeader className="relative border-b px-5 pb-4 pt-5" style={{ background: `linear-gradient(135deg, ${statusColor}10 0%, transparent 70%)` }}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md shadow-sm" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                                <Activity className="h-3.5 w-3.5" />
                            </div>
                            Lead Pipeline
                        </CardTitle>
                        <CardDescription className="mt-1 text-xs">Track every stage from new lead to final outcome.</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 px-5 pb-6 pt-5">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground">Manually set status</label>
                        <span className="text-[10px] font-medium text-muted-foreground">Advanced</span>
                    </div>
                    <Select value={status} onValueChange={onStatusChange} disabled={saving}>
                        <SelectTrigger className="h-9 bg-background shadow-sm" data-testid="status-select"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {LEAD_STATUSES.map((stage) => {
                                const currentIdx = LEAD_STATUSES.indexOf(status);
                                const stageIdx = LEAD_STATUSES.indexOf(stage);
                                const isBackward = stageIdx < currentIdx && stage !== "DISQUALIFIED";
                                return (
                                    <SelectItem key={stage} value={stage} disabled={isBackward} title={isBackward ? "Cannot move backward" : undefined}>
                                        <span className="flex items-center gap-2">{STATUS_META[stage].icon}<span>{titleCase(stage)}</span></span>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs font-semibold">Journey timeline</span>
                        <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px] font-medium">
                            {(statusHistory?.length ?? 1)} stage{(statusHistory?.length ?? 1) === 1 ? "" : "s"}
                        </Badge>
                    </div>
                    <OrderStatusTimeline status={status} statusHistory={statusHistory} />
                </div>
            </CardContent>
        </Card>
    );
}