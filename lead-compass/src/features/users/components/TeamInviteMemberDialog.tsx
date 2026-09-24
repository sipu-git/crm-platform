import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { ROLE_OPTIONS, Role, SearchPersonResult } from "@/features/users/types";
import { useUserMutations } from "@/features/users/hooks/useUsers";
import { ROLE_ICONS, ROLE_LABELS } from "@/features/users/components/TeamStyles";
import { inviteUserSchema, InviteUserInput } from "@/features/users/validation";
import { userApi } from "@/features/users/apis/users.apis";
import { FormAlert, useFormAlert } from "@/components/ui/form-alert";
import {
    Search,
    UserPlus,
    Loader2,
    Mail,
    Phone,
    User,
    Briefcase,
} from "lucide-react";

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
    const { alert, showSuccess, showError, dismiss } = useFormAlert();

    // Global search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchPersonResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Reset form and mutation state when dialog is closed
    useEffect(() => {
        if (!open) {
            setForm(EMPTY_FORM);
            setErrors({});
            dismiss();
            setSearchQuery("");
            setSearchResults([]);
            setShowDropdown(false);
            setSearchLoading(false);
            // Clear any pending debounce timer
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
                searchTimerRef.current = null;
            }
            invite.reset();
            if (typeof document !== "undefined") {
                document.body.style.pointerEvents = "";
            }
        }
    }, [open]);

    // Handle mutation results via FormAlert
    useEffect(() => {
        if (invite.isError) {
            showError(invite.error?.message ?? "Failed to invite user");
        }
    }, [invite.isError, invite.error]);

    useEffect(() => {
        if (invite.isSuccess) {
            showSuccess("Invitation sent successfully! They'll receive an email shortly.");
            // Auto close after brief pause so user sees the success
            const t = setTimeout(() => onOpenChange(false), 1500);
            return () => clearTimeout(t);
        }
    }, [invite.isSuccess, onOpenChange]);

    // Debounced global search
    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

        if (value.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        setSearchLoading(true);
        searchTimerRef.current = setTimeout(async () => {
            try {
                const results = await userApi.searchPeople(value.trim());
                setSearchResults(results);
                setShowDropdown(results.length > 0);
            } catch {
                setSearchResults([]);
                setShowDropdown(false);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    }, []);

    // Select a search result and fill the form
    const selectPerson = useCallback((person: SearchPersonResult) => {
        setForm(prev => ({
            ...prev,
            full_name: person.name || prev.full_name,
            email: person.email || prev.email,
            mobile: person.phone || prev.mobile,
        }));
        setSearchQuery("");
        setSearchResults([]);
        setShowDropdown(false);
        setErrors({});
        dismiss();
    }, [dismiss]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [showDropdown]);

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
        dismiss();
        // Validate only the changed field by running full schema and extracting the field error
        const result = inviteUserSchema.safeParse(updated);
        if (result.success) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        } else {
            const fieldErr = result.error.errors.find(e => e.path[0] === name);
            setErrors(prev => ({ ...prev, [name]: fieldErr?.message }));
        }
    };

    const hasErrors = Object.values(errors).some(Boolean);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dismiss();
        if (!runValidation(form)) {
            showError("Please fix the highlighted fields before sending.");
            return;
        }
        invite.mutate(form);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <UserPlus className="h-4 w-4 text-primary" />
                        </div>
                        Invite a team member
                    </DialogTitle>
                    <DialogDescription>
                        Search your contacts or enter details manually. They'll receive a secure invitation email.
                    </DialogDescription>
                </DialogHeader>

                {/* Global search */}
                <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={e => handleSearchChange(e.target.value)}
                            placeholder="Search contacts by name or email..."
                            className="pl-9 bg-muted/40"
                        />
                        {searchLoading && (
                            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {/* Search results dropdown */}
                    {showDropdown && (
                        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-md max-h-48 overflow-auto">
                            {searchResults.map(person => (
                                <button
                                    key={person.id}
                                    type="button"
                                    onClick={() => selectPerson(person)}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{person.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{person.email}</p>
                                    </div>
                                    {person.designation && (
                                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                            <Briefcase className="h-2.5 w-2.5" />
                                            {person.designation}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">or enter details</span>
                    </div>
                </div>

                {/* Alert zone */}
                <FormAlert alert={alert} onDismiss={dismiss} />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="full_name" className="text-xs font-medium">Full name</Label>
                        <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="full_name"
                                placeholder="John Doe"
                                value={form.full_name}
                                onChange={e => handleChange("full_name", e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={form.email}
                                onChange={e => handleChange("email", e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    {/* Mobile */}
                    <div className="space-y-1.5">
                        <Label htmlFor="mobile" className="text-xs font-medium">Mobile</Label>
                        <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="mobile"
                                placeholder="1234567890"
                                value={form.mobile}
                                onChange={e => handleChange("mobile", e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Role</Label>
                        <Select
                            value={form.role}
                            onValueChange={role => handleChange("role", role as Role)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLE_OPTIONS.map(r => (
                                    <SelectItem key={r} value={r}>
                                        <span className="flex items-center gap-2">
                                            {ROLE_ICONS[r]}
                                            {ROLE_LABELS[r] ?? r}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={invite.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={invite.isPending || hasErrors}>
                            {invite.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending…
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Send invite
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
