import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, User } from "lucide-react";
import { toast } from "sonner";
import { assignLead } from "@/features/leads/service1/slice";
import { LeadAssignee } from "@/features/leads/service2/assign.types";
import { createAssign, fetchAssignees, selectAssignees, selectAssigneesLoading } from "@/features/leads/service2/slice";

interface AssignLeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    leadId: string;
    currentAssignee?: LeadAssignee | null;
}

export function AssignLeadDialog({ open, onOpenChange, leadId, currentAssignee }: AssignLeadDialogProps) {
    const dispatch = useAppDispatch();
    const assignees = useAppSelector(selectAssignees);
    const loadingAssignees = useAppSelector(selectAssigneesLoading);

    const [mode, setMode] = useState<"select" | "create">("select");
    const [selectedId, setSelectedId] = useState<string>("");
    const [saving, setSaving] = useState(false);

    // new-assignee form fields
    const [fullName, setFullName] = useState("");
    const [designation, setDesignation] = useState("");
    const [department, setDepartment] = useState("");

    useEffect(() => {
        if (open) {
            dispatch(fetchAssignees());
            setMode("select");
            setSelectedId(currentAssignee?.id ?? "");
            setFullName("");
            setDesignation("");
            setDepartment("");
        }
    }, [open, dispatch, currentAssignee?.id]);

    const handleAssign = async (assignId: string) => {
        setSaving(true);
        try {
            await dispatch(assignLead({ leadId, assignId })).unwrap();
            toast.success("Lead assigned");
            onOpenChange(false);
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to assign lead");
        } finally {
            setSaving(false);
        }
    };

    const handleSelectExisting = () => {
        if (!selectedId) {
            toast.error("Choose someone to assign this lead to");
            return;
        }
        handleAssign(selectedId);
    };

    const handleCreateAndAssign = async () => {
        if (!fullName.trim() || !designation.trim()) {
            toast.error("Name and designation are required");
            return;
        }
        setSaving(true);
        try {
            const newAssignee = await dispatch(
                createAssign({
                    full_name: fullName.trim(),
                    designation: designation.trim(),
                    department: department.trim() || undefined,
                })
            ).unwrap();
            await handleAssign(newAssignee.id);
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to create assignee");
            setSaving(false);
        }
    };

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
                    >
                        <User className="mr-2 h-3.5 w-3.5" />
                        Choose existing
                    </Button>
                    <Button
                        type="button"
                        variant={mode === "create" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setMode("create")}
                    >
                        <UserPlus className="mr-2 h-3.5 w-3.5" />
                        Add new person
                    </Button>
                </div>

                {mode === "select" ? (
                    <div className="space-y-3 py-2">
                        <Select value={selectedId} onValueChange={setSelectedId} disabled={loadingAssignees || saving}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={loadingAssignees ? "Loading…" : "Select a person"} />
                            </SelectTrigger>
                            <SelectContent>
                                {(assignees ?? []).map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.full_name}
                                        {a.designation ? ` · ${a.designation}` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {(assignees ?? []).length === 0 && !loadingAssignees && (
                            <p className="text-xs text-muted-foreground">
                                Nobody's been added yet — switch to "Add new person" to create one.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3 py-2">
                        <Input
                            placeholder="Full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={saving}
                        />
                        <Input
                            placeholder="Designation"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            disabled={saving}
                        />
                        <Input
                            placeholder="Department (optional)"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            disabled={saving}
                        />
                        <p className="text-xs text-muted-foreground">
                            This person doesn't need a login account — just enter their details to make them assignable.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        onClick={mode === "select" ? handleSelectExisting : handleCreateAndAssign}
                        disabled={saving}
                    >
                        {saving ? "Assigning…" : "Assign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}