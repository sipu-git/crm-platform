import { useLogout } from "@/features/auth/hooks/useAuth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleLabel } from "../UserRoleBadge";
import { LogOut } from "lucide-react";
import { useProfile } from "@/features/profiles/hooks/useProfile";

export function UserMenu() {
    const { data: profile, isLoading } = useProfile();
    const nav = useNavigate();
    const { tenantSlug = "" } = useParams();
    const { mutateAsync: doLogout } = useLogout();

    const name = profile?.user.full_name ?? "";
    const email = profile?.user.email ?? "";
    const role = profile?.user.role ?? "";

    const initials = (name || "?").split(" ").filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

    async function handleSignOut() {
        await doLogout();
        nav("/login");
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-auto items-center gap-2 px-2 py-0.5"
                >
                    <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-[hsla(264,97%,15%,1)] text-xs font-medium text-primary hover:hover:bg-warning-foreground">
                            {isLoading ? "…" : initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="hidden text-xs md:inline text-sidebar-foreground">{name}</span>
                        <RoleLabel role={role} className="text-muted-foreground" variant="text" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel onClick={() => nav(`/${tenantSlug}/profile`)} className="flex flex-col cursor-pointer">
                    <span>{name}</span>
                    <span className="text-xs text-muted-foreground">{email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}