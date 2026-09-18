import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TeamUser } from "@/features/users/types";

type Props = {
    open: boolean;
    pendingRemove: TeamUser | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export function TeamRemoveMemberDialog({ open, pendingRemove, onOpenChange, onConfirm }: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove Member</AlertDialogTitle>
                    <AlertDialogDescription>
                        {pendingRemove && (
                            <>
                                Are you sure you want to remove <strong>{pendingRemove.full_name || pendingRemove.email}</strong> ({pendingRemove.email}) from this workspace? They will lose access to all CRM resources immediately.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onConfirm}>
                        Remove
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
