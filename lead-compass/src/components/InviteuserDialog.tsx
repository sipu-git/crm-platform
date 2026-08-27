import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Role, ROLE_OPTIONS } from "@/features/users/types";
import { clearInviteResult, inviteUser } from "@/features/users/slice";

const EMPTY_FORM = { full_name: "", email: "", mobile: "", role: "SALES_REP" as Role };

export function InviteUserDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const dispatch = useAppDispatch();
    const { inviteStatus, inviteError, lastInviteResult } = useAppSelector((s) => s.users);
    const [form, setForm] = useState(EMPTY_FORM);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open) {
            // reset local + slice state when the dialog closes so a stale
            // temp password never lingers past this session
            setForm(EMPTY_FORM);
            setCopied(false);
            dispatch(clearInviteResult());
        }
    }, [open, dispatch]);

    useEffect(() => {
        if (inviteStatus === "failed" && inviteError) {
            toast.error(inviteError);
        }
    }, [inviteStatus, inviteError]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        dispatch(inviteUser(form));
    }

    function copyPassword() {
        if (!lastInviteResult) return;
        navigator.clipboard.writeText(lastInviteResult.tempPassword);
        setCopied(true);
        toast.success("Copied to clipboard");
    }

    const invited = !!lastInviteResult;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {!invited ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Invite a team member</DialogTitle>
                            <DialogDescription>
                                They'll be added to your workspace with the role you choose below.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full name</Label>
                                <Input
                                    id="full_name"
                                    required
                                    value={form.full_name}
                                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile</Label>
                                <Input
                                    id="mobile"
                                    required
                                    value={form.mobile}
                                    onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select
                                    value={form.role}
                                    onValueChange={(role: Role) => setForm((f) => ({ ...f, role }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLE_OPTIONS.filter((r) => r !== "CLIENT").map((r) => (
                                            <SelectItem key={r} value={r}>{r}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={inviteStatus === "loading"}>
                                    {inviteStatus === "loading" ? "Sending..." : "Send invite"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Invite sent</DialogTitle>
                            <DialogDescription>
                                Share this temporary password with {lastInviteResult.user.full_name} — it
                                won't be shown again.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
                            <code className="flex-1 text-sm">{lastInviteResult.tempPassword}</code>
                            <Button variant="ghost" size="icon" onClick={copyPassword}>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => onOpenChange(false)}>Done</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}