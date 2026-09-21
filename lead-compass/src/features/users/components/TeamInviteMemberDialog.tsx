import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ROLE_OPTIONS, Role } from "@/features/users/types";
import { useUserMutations } from "@/features/users/hooks/useUsers";
import { ROLE_ICONS } from "@/features/users/components/TeamStyles";
import { inviteUserSchema, InviteUserInput } from "@/features/users/validation";

const EMPTY_FORM: InviteUserInput = {
    full_name: "",
    email: "",
    mobile: "",
    role: "SALES_REP",
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function TeamInviteMemberDialog({ open, onOpenChange }: Props) {
    const { invite } = useUserMutations();
    const [form, setForm] = useState<InviteUserInput>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof InviteUserInput, string>>>({});

    // Reset form and mutation state when dialog is closed
    useEffect(() => {
        if (!open) {
            setForm(EMPTY_FORM);
            setErrors({});
            invite.reset();
            if (typeof document !== "undefined") {
                document.body.style.pointerEvents = "";
            }
        }
    }, [open]);

    // Show toast on mutation error
    useEffect(() => {
        if (invite.isError) {
            toast.error(invite.error?.message ?? "Failed to invite user");
        }
    }, [invite.isError, invite.error]);

    // Close dialog and notify on mutation success
    useEffect(() => {
        if (invite.isSuccess) {
            toast.success("Invitation sent successfully");
            onOpenChange(false);
        }
    }, [invite.isSuccess, onOpenChange]);

    // Run full validation using Zod
    const runValidation = (data: InviteUserInput) => {
        const result = inviteUserSchema.safeParse(data);
        if (result.success) {
            setErrors({});
            return true;
        }
        const fieldErrors: Partial<Record<keyof InviteUserInput, string>> = {};
        result.error.errors.forEach(err => {
            const path = err.path[0] as keyof InviteUserInput;
            fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
        return false;
    };

    const handleChange = (name: keyof InviteUserInput, value: string) => {
        const updated = { ...form, [name]: value } as InviteUserInput;
        setForm(updated);
        // Instant feedback for updated field
        const fieldResult = inviteUserSchema.pick({ [name]: true }).safeParse({ [name]: value });
        setErrors(prev => ({
            ...prev,
            [name]: fieldResult.success ? undefined : fieldResult.error.errors[0]?.message,
        }));
    };

    const hasErrors = Object.values(errors).some(Boolean);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!runValidation(form)) {
            toast.error("Please fix the highlighted fields.");
            return;
        }
        invite.mutate(form);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite a team member</DialogTitle>
                    <DialogDescription>
                        They'll be added to your workspace with the role you choose below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full name */}
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full name</Label>
                        <Input
                            id="full_name"
                            placeholder="John Doe"
                            value={form.full_name}
                            onChange={e => handleChange("full_name", e.target.value)}
                        />
                        {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={form.email}
                            onChange={e => handleChange("email", e.target.value)}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    {/* Mobile */}
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile</Label>
                        <Input
                            id="mobile"
                            placeholder="1234567890"
                            value={form.mobile}
                            onChange={e => handleChange("mobile", e.target.value)}
                        />
                        {errors.mobile && <p className="text-sm text-destructive">{errors.mobile}</p>}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                            value={form.role}
                            onValueChange={role => handleChange("role", role as Role)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLE_OPTIONS.filter(r => r !== "CLIENT").map(r => (
                                    <SelectItem key={r} value={r}>
                                        <span className="flex items-center gap-2">
                                            {ROLE_ICONS[r]}
                                            {r}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={invite.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={invite.isPending || hasErrors}>
                            {invite.isPending ? "Sending..." : "Send invite"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
