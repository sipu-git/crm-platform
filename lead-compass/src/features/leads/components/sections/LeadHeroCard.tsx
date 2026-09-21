import { Link } from "react-router-dom";
import { Briefcase, Building2, Calendar, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function LeadHeroCard({
    fullName, initials, statusColor, designation, companyName, createdDate, email, phone,
}: {
    fullName: string;
    initials: string;
    statusColor: string;
    designation?: string | null;
    companyName?: string | null;
    createdDate: string | null;
    email?: string | null;
    phone?: string | null;
}) {
    return (
        <Card className="relative flex flex-col justify-center overflow-hidden bg-card border-border/60 shadow-sm">
            <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-3xl"
                style={{ backgroundColor: statusColor }}
                aria-hidden="true"
            />
            <CardContent className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                    <Avatar className="h-16 w-16 shrink-0 border-2 shadow-sm" style={{ borderColor: statusColor }}>
                        <AvatarFallback className="text-lg font-bold" style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
                            {initials || "?"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold leading-tight">{fullName || "Unnamed Contact"}</h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                            {designation && (
                                <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{designation}</span>
                            )}
                            {companyName && (
                                <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{companyName}</span>
                            )}
                            {createdDate && (
                                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Added {createdDate}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {email && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link to={`mailto:${email}`} data-testid="hero-email-link">
                                    <Button variant="secondary" size="icon" className="h-9 w-9"><Mail className="h-4 w-4" /></Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Email {email}</TooltipContent>
                        </Tooltip>
                    )}
                    {phone && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link to={`tel:${phone}`} data-testid="hero-phone-link">
                                    <Button variant="secondary" size="icon" className="h-9 w-9"><Phone className="h-4 w-4" /></Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Call {phone}</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}