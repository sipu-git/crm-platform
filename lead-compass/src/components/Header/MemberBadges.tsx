import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useUsers } from "@/features/users/hooks/useUsers";
import { TeamUser } from "@/features/users/types";


export default function MemberBadges() {
    const { data: members = [], isLoading } = useUsers();

    const getInitials = (name: string) => (name || "").split(" ").map((s) => s[0])
        .slice(0, 2).join("")
        .toUpperCase();

    if (isLoading) return null;

    // If there are no members, render nothing to keep the header clean.
    if (members.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-9 gap-1.5 px-3 border border-sidebar-border bg-background rounded-full hover:bg-muted text-xs font-semibold"
                >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Members</span>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 text-primary px-1 text-[11px] font-bold">
                        {members.length}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="w-64 max-h-80 overflow-y-auto p-1 z-50 bg-card"
            >
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                    Workspace Members
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {members.map((member: TeamUser) => (
                    <div
                        key={member.id}
                        className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/40 transition-colors"
                    >
                        <Avatar className="h-7 w-7 border">
                            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                {getInitials(member.full_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-foreground truncate">
                                {member.full_name}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                                {member.role}
                            </div>
                        </div>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}