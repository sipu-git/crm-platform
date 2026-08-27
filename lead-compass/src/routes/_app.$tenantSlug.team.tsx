import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { usePermission } from "@/hooks/use-permission";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Role, ROLE_OPTIONS, TeamUser } from "@/features/users/types";
import { fetchUsers, resetRemoveStatus, resetUpdateRoleStatus, updateUserRole, removeUser } from "@/features/users/slice";
import { InviteUserDialog } from "@/components/InviteuserDialog";

function initials(name: string) {
    return name.split(" ").map((s) => s[0]).slice(0, 2).join("");
}

export function TeamPage() {
    const dispatch = useAppDispatch();
    const { can } = usePermission();
    const currentUserId = useAppSelector((s) => s.auth.user?.id);

    const { items, status, error, updateRoleStatus, updateRoleError,
        removeStatus, removeError } = useAppSelector(
            (s) => s.users,
        );

    const [inviteOpen, setInviteOpen] = useState(false);
    const [pendingChange, setPendingChange] = useState<{ user: TeamUser; newRole: Role } | null>(null);
    const [pendingRemove, setPendingRemove] = useState<TeamUser | null>(null);

    const canManage = can("users:manage");

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        if (updateRoleStatus === "succeeded") {
            toast.success("Role updated");
            dispatch(resetUpdateRoleStatus());
        }
        if (updateRoleStatus === "failed" && updateRoleError) {
            toast.error(updateRoleError);
            dispatch(resetUpdateRoleStatus());
        }
    }, [updateRoleStatus, updateRoleError, dispatch]);

    useEffect(() => {
        if (removeStatus === "succeeded") {
            toast.success("Member removed from workspace");
            dispatch(resetRemoveStatus());
        }
        if (removeStatus === "failed" && removeError) {
            toast.error(removeError);
            dispatch(resetRemoveStatus());
        }
    }, [removeStatus, removeError, dispatch]);

    function confirmRoleChange() {
        if (!pendingChange) return;
        dispatch(updateUserRole({ userId: pendingChange.user.id, role: pendingChange.newRole }));
        setPendingChange(null);
    }

    function confirmRemoveUser() {
        if (!pendingRemove) return;
        dispatch(removeUser(pendingRemove.id));
        setPendingRemove(null);
    }

    if (status === "loading" && items.length === 0) {
        return <div className="p-6 text-sm text-muted-foreground">Loading team...</div>;
    }

    if (status === "failed") {
        return <div className="p-6 text-sm text-destructive">{error}</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Team</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage who has access to this workspace and their role.
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => setInviteOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Invite member
                    </Button>
                )}
            </div>

            <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-card border-border text-left text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Mobile</th>
                            <th className="px-4 py-3 font-medium">Role</th>
                            {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y bg-input">
                        {items.map((u) => {
                            const isSelf = u.id === currentUserId;
                            return (
                                <tr key={u.id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className="text-xs">{initials(u.full_name)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{u.full_name}</span>
                                            {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{u.mobile}</td>
                                    <td className="px-4 py-3">
                                        {canManage && !isSelf ? (
                                            <Select
                                                value={u.role}
                                                onValueChange={(newRole: Role) =>
                                                    setPendingChange({ user: u, newRole })
                                                }
                                            >
                                                <SelectTrigger className="h-8 w-36">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROLE_OPTIONS.map((r) => (
                                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                {u.role}
                                            </span>
                                        )}
                                    </td>
                                    {canManage && (
                                        <td className="px-4 py-3 text-right">
                                            {!isSelf && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => setPendingRemove(u)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                                                </Button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />

            <AlertDialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change role?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingChange && (
                                <>
                                    Change <strong>{pendingChange.user.full_name}</strong>'s role from{" "}
                                    <strong>{pendingChange.user.role}</strong> to{" "}
                                    <strong>{pendingChange.newRole}</strong>? This takes effect immediately.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRoleChange}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!pendingRemove} onOpenChange={(open) => !open && setPendingRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingRemove && (
                                <>
                                    Are you sure you want to remove <strong>{pendingRemove.full_name}</strong> ({pendingRemove.email}) from this workspace? They will lose access to all CRM resources immediately.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={confirmRemoveUser}
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}