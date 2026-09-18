import { useCallback, useEffect, useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, User } from "lucide-react";
import { toast } from "sonner";
import { CreateAssigneeInput, LeadAssignee } from "@/features/leads/types/assign.types";
import { useAssign, useAssignment } from "@/features/leads/hooks/useAssignment";
import { useUsers } from "@/features/users/hooks/useUsers";
// import { useUsers } from "@/features/auth/hooks/useAuth";

interface AssignLeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    leadId: string;
    currentAssignee?: LeadAssignee | null;
    assignees?: any;
    isLoading?: boolean;
    isError?: boolean;
}

type Mode = "select" | "create";
type CreateAssigneeForm = Required<Pick<CreateAssigneeInput, "full_name" | "designation" | "department">>;

const emptyForm: CreateAssigneeForm = {
    full_name: "",
    designation: "",
    department: "",
};

export function AssignLeadDialog({ open, onOpenChange, leadId, currentAssignee }: AssignLeadDialogProps) {
    const { data: users = [], isLoading: loadingSalesReps, isError: assigneesError } = useUsers();
    const salesRepUsers = users.filter((u) => (u as any).role === "SALES_REP");

    const [mode, setMode] = useState<Mode>("select");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [form, setForm] = useState<CreateAssigneeForm>(emptyForm);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { mutateAsync: createAssign, isPending: submitting } = useAssign();

    useEffect(() => {
        if (!open) return;
        setMode("select");
        setSelectedUserId(currentAssignee?.id ?? "");
        setForm(emptyForm);
        setSubmitError(null);
    }, [open, leadId, currentAssignee?.id]);

    const canSubmitSelect = mode === "select" && !!selectedUserId;
    const canSubmitCreate = mode === "create" && form.full_name.trim().length > 0 && form.designation.trim().length > 0;

    const submit = useCallback(
        async (data: CreateAssigneeInput) => {
            setSubmitError(null);
            try {
                await createAssign({ leadId, data });
                toast.success("Lead assigned");
                onOpenChange(false);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to assign lead";
                setSubmitError(message);
                toast.error(message);
            }
        },
        [createAssign, leadId, onOpenChange]
    );

    const handleSelectExisting = useCallback(() => {
        if (!selectedUserId) {
            toast.error("Choose a sales rep to assign this lead to");
            return;
        }
        submit({ assignId: selectedUserId });
    }, [selectedUserId, submit]);

    const handleCreateAndAssign = useCallback(() => {
        if (!canSubmitCreate) {
            toast.error("Name and designation are required");
            return;
        }
        submit({
            full_name: form.full_name.trim(),
            designation: form.designation.trim(),
            department: form.department.trim() || undefined,
        });
    }, [canSubmitCreate, form, submit]);

    const updateForm = useCallback(
        (field: keyof CreateAssigneeForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }));
        },
        []
    );

    const canSubmit = mode === "select" ? canSubmitSelect : canSubmitCreate;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign lead</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 border-b pb-3">
                    <Button
                        type="button"
                        variant={mode === "select" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setMode("select")}
                        disabled={submitting}
                    >
                        <User className="mr-2 h-3.5 w-3.5" />
                        Choose sales rep
                    </Button>
                    <Button
                        type="button"
                        variant={mode === "create" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setMode("create")}
                        disabled={submitting}
                    >
                        <UserPlus className="mr-2 h-3.5 w-3.5" />
                        Add new person
                    </Button>
                </div>

                {mode === "select" ? (
                    <div className="space-y-3 py-2">
                        <Select
                            value={selectedUserId}
                            onValueChange={setSelectedUserId}
                            disabled={loadingSalesReps || submitting}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={loadingSalesReps ? "Loading…" : "Select a sales rep"} />
                            </SelectTrigger>
                            <SelectContent>
                                {salesRepUsers.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.full_name}
                                        {u.email ? ` · ${u.email}` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {assigneesError && (
                            <p className="text-xs text-destructive" role="alert">
                                Couldn't load sales reps. Try again, or switch to "Add new person".
                            </p>
                        )}
                        {!loadingSalesReps && !assigneesError && salesRepUsers.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                No sales reps found — invite one from Team Management, or switch to "Add new person".
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3 py-2">
                        <Input
                            placeholder="Full name"
                            value={form.full_name}
                            onChange={updateForm("full_name")}
                            disabled={submitting}
                        />
                        <Input
                            placeholder="Designation"
                            value={form.designation}
                            onChange={updateForm("designation")}
                            disabled={submitting}
                        />
                        <Input
                            placeholder="Department (optional)"
                            value={form.department}
                            onChange={updateForm("department")}
                            disabled={submitting}
                        />
                        <p className="text-xs text-muted-foreground">
                            This person doesn't need a login account — just enter their details to make them assignable.
                        </p>
                    </div>
                )}

                {submitError && (
                    <p className="text-xs text-destructive" role="alert">
                        {submitError}
                    </p>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={mode === "select" ? handleSelectExisting : handleCreateAndAssign}
                        disabled={submitting || !canSubmit}
                    >
                        {submitting ? "Assigning…" : "Assign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}