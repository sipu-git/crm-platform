import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Users, Phone, Check, Trash2, UserPlus, ChevronDown, Calendar,
} from "lucide-react";
import { ROLE_OPTIONS, Role, Invite } from "@/features/users/types";
import {
    ROLE_RING,
    DEFAULT_ROLE_RING,
    avatarStyle,
    initials,
    ROLE_ICONS,
    ROLE_STYLES,
    ROLE_LABELS,
    DEFAULT_ROLE_STYLE,
    RoleBadge,
    StatusBadge,
    SortButton,
    SortField,
    SortDir,
} from "./TeamStyles";

type Props = {
    items: Invite[];
    filteredItems: Invite[];
    isInitialLoad: boolean;
    currentUserId?: string;
    canManage: boolean;
    query: string;
    roleFilter: string;
    sortField: SortField;
    sortDir: SortDir;
    onInvite: () => void;
    onSort: (field: SortField) => void;
    onChangeRole: (user: Invite, newRole: Role) => void;
    onRemove: (user: Invite) => void;
    onClearFilters: () => void;
};

export function TeamMembersTable({
    items,
    filteredItems,
    isInitialLoad,
    currentUserId,
    canManage,
    query,
    roleFilter,
    sortField,
    sortDir,
    onInvite,
    onSort,
    onChangeRole,
    onRemove,
    onClearFilters,
}: Props) {
    return (
        <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            <div className="max-h-[65vh] overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="h-11 w-[32%] min-w-[220px]">
                                <SortButton field="name" label="Member" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                            </TableHead>
                            <TableHead className="h-11 w-[20%] min-w-[150px]">Phone</TableHead>
                            <TableHead className="h-11 w-[18%] min-w-[140px]">
                                <SortButton field="role" label="Role" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                            </TableHead>
                            <TableHead className="h-11 w-[15%] min-w-[120px]">Joined</TableHead>
                            <TableHead className="h-11 w-[11%] min-w-[100px]">Status</TableHead>
                            <TableHead className="h-11 w-[4%] min-w-[60px] text-right pr-4">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isInitialLoad && Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i} className="hover:bg-transparent">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                                        <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
                                    </div>
                                </TableCell>
                                <TableCell><div className="h-3.5 w-28 rounded bg-muted animate-pulse" /></TableCell>
                                <TableCell><div className="h-6 w-24 rounded-full bg-muted animate-pulse" /></TableCell>
                                <TableCell><div className="h-3.5 w-24 rounded bg-muted animate-pulse" /></TableCell>
                                <TableCell><div className="h-6 w-20 rounded-full bg-muted animate-pulse" /></TableCell>
                                <TableCell><div className="h-8 w-8 rounded bg-muted animate-pulse ml-auto" /></TableCell>
                            </TableRow>
                        ))}

                        {!isInitialLoad && filteredItems.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6}>
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="rounded-full bg-muted/50 p-4 mb-3">
                                            <Users className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium">No members found</h3>
                                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                            {query || roleFilter !== "ALL"
                                                ? "No one matches these filters. Try clearing the search or role filter."
                                                : "No one's been added to this workspace yet."}
                                        </p>
                                        {canManage && !query && roleFilter === "ALL" && (
                                            <Button onClick={onInvite} variant="outline" className="mt-4">
                                                <UserPlus className="mr-2 h-4 w-4" /> Invite your first member
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {!isInitialLoad && filteredItems.map((u) => {
                            const isSelf = u.id === currentUserId;
                            const hasFullName = Boolean(u.full_name?.trim());
                            const displayName = hasFullName ? u.full_name!.trim() : u.email.split("@")[0];
                            const phoneNum = (u.mobile || u.phone)?.trim();
                            const joinedDateStr = u.createdAt || u.createdAt;
                            const formattedJoined = joinedDateStr
                                ? new Date(joinedDateStr).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                  })
                                : null;

                            return (
                                <TableRow key={u.id} className={`group ${isSelf ? "bg-primary/3" : ""}`}>
                                    {/* Member Column */}
                                    <TableCell>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className={`h-9 w-9 shrink-0 ${ROLE_RING[u.role] ?? DEFAULT_ROLE_RING}`}>
                                                <AvatarFallback className={`text-xs font-semibold ${avatarStyle(displayName)}`}>
                                                    {initials(displayName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium truncate text-foreground">{displayName}</span>
                                                    {isSelf && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary shrink-0">You</span>}
                                                </div>
                                                <span className="text-[11px] text-muted-foreground/70 block truncate">
                                                    {hasFullName ? u.email : "No full name specified"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Phone Column */}
                                    <TableCell>
                                        {phoneNum ? (
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                                {phoneNum}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground/40 italic">Not set</span>
                                        )}
                                    </TableCell>

                                    {/* Role Column (Interactive Badge Switcher) */}
                                    <TableCell>
                                        {canManage && !isSelf ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all hover:shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                                                            ROLE_STYLES[u.role] ?? DEFAULT_ROLE_STYLE
                                                        }`}
                                                        aria-label={`Change role for ${displayName}`}
                                                    >
                                                        {ROLE_ICONS[u.role]}
                                                        <span>{ROLE_LABELS[u.role] ?? u.role}</span>
                                                        <ChevronDown className="h-3 w-3 opacity-60 ml-0.5 shrink-0" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-48 z-50">
                                                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        Select Role
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {ROLE_OPTIONS.map((r) => (
                                                        <DropdownMenuItem
                                                            key={r}
                                                            onClick={() => r !== u.role && onChangeRole(u, r)}
                                                            className="flex items-center justify-between text-xs py-1.5 cursor-pointer"
                                                        >
                                                            <span className="flex items-center">
                                                                {ROLE_ICONS[r]}
                                                                {ROLE_LABELS[r] ?? r}
                                                            </span>
                                                            {r === u.role && <Check className="h-3.5 w-3.5 text-primary" />}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <RoleBadge role={u.role} />
                                        )}
                                    </TableCell>

                                    {/* Joined Column */}
                                    <TableCell>
                                        {formattedJoined ? (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                                <span>{formattedJoined}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground/40">—</span>
                                        )}
                                    </TableCell>

                                    {/* Status Column */}
                                    <TableCell>
                                        <StatusBadge status={u.status} />
                                    </TableCell>

                                    {/* Dedicated Action Column (Remove Member) */}
                                    <TableCell className="text-right pr-4">
                                        {canManage && !isSelf && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onRemove(u)}
                                                className="h-8 w-8 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                title={`Remove ${displayName}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {!isInitialLoad && filteredItems.length === 0 && (
                <div className="flex items-center justify-between border-t px-5 py-2.5 text-xs text-muted-foreground">
                    <span>
                        Showing {filteredItems.length} of {items.length} member{items.length === 1 ? "" : "s"}
                    </span>
                    {(query || roleFilter !== "ALL") && (
                        <button type="button" onClick={onClearFilters} className="font-medium hover:text-foreground transition-colors">
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
