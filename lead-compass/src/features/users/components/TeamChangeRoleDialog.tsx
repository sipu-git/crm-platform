import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TeamUser, Role } from "@/features/users/types";

type Props = {
    open: boolean;
    pendingChange: { user: TeamUser; newRole: Role } | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export function TeamChangeRoleDialog({ open, pendingChange, onOpenChange, onConfirm }: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Change Role</AlertDialogTitle>
                    <AlertDialogDescription>
                        {pendingChange && (
                            <>
                                Change <strong>{pendingChange.user.full_name || pendingChange.user.email}</strong>'s role from{" "}
                                <span className="font-medium text-foreground">{pendingChange.user.role}</span> to{" "}
                                <span className="font-medium text-foreground">{pendingChange.newRole}</span>? This takes effect immediately.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Confirm Change</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
