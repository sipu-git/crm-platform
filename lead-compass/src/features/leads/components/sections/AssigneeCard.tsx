import { memo } from "react";
import { Briefcase, Mail, User, UserCog, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LeadAssignee } from "@/features/leads/types/assign.types";

export const AssigneeCard = memo(function AssigneeCard({
    assignee,
    onAssignClick,
}: {
    assignee?: LeadAssignee | null;
    onAssignClick?: () => void;
}) {
    const initials = assignee?.full_name?.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

    return (
        <Card className="overflow-hidden border-border/60 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 pb-2 pt-5">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <UserCog className="h-4 w-4 text-primary" />
                    Assigned to
                </CardTitle>
                <Button size="sm" variant="default" className="h-7 text-xs" onClick={onAssignClick} data-testid="assignee-card-action">
                    {assignee ? "Reassign" : "Assign"}
                </Button>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                {assignee ? (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 shrink-0 border">
                            <AvatarFallback className="text-sm font-semibold">
                                {initials || <User className="h-4 w-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            {/* fixed: name and designation are now siblings, designation on its own line
                  instead of being nested inside the name's flex row */}
                            <p className="truncate text-sm font-semibold leading-tight" data-testid="assignee-name">
                                {assignee.full_name}
                            </p>
                            {assignee.designation && (
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Briefcase className="h-3 w-3 shrink-0" />
                                    {assignee.designation}
                                    {assignee.department ? ` · ${assignee.department}` : ""}
                                </p>
                            )}
                            {assignee.email && (
                                <div className="mt-1 inline-flex items-center gap-1.5">
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span className="truncate text-xs text-muted-foreground">{assignee.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-4 text-center">
                        <UserPlus className="h-5 w-5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Not yet assigned to anyone</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});