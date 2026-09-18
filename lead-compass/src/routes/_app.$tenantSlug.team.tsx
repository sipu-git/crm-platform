import { ProtectedRoute } from "@/components/ProtectedRoutes";
import { usePermission } from "@/hooks/use-permission";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUsers";
import { useUsers, useUserMutations } from "@/features/users/hooks/useUsers";
import { PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { Role, ROLE_OPTIONS } from "@/features/users/types";
import { TeamMembersTable } from "@/components/team/TeamMembersTable";
import { TeamInvitationsList } from "@/components/team/TeamInvitationsList";
import { TeamInviteMemberDialog } from "@/components/team/TeamInviteMemberDialog";
import { TeamChangeRoleDialog } from "@/components/team/TeamChangeRoleDialog";
import { TeamRemoveMemberDialog } from "@/components/team/TeamRemoveMemberDialog";
import { ROLE_DOT, DEFAULT_ROLE_DOT } from "@/components/team/TeamStyles";
import React from "react";

export default function TeamPage() {
  const { can } = usePermission();
  const currentUser = useCurrentUser();
  const currentUserId = currentUser.user?.id;

  const { data: items = [], isLoading, isError, error } = useUsers();
  const { updateRole, remove } = useUserMutations();

  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");
  const [sortField, setSortField] = React.useState<"name" | "role">("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [pendingChange, setPendingChange] = React.useState<{
    user: any;
    newRole: Role;
  } | null>(null);
  const [pendingRemove, setPendingRemove] = React.useState<any | null>(null);

  const canManage = can("users:manage");

  React.useEffect(() => {
    if (updateRole.isSuccess) toast.success("Role updated");
    if (updateRole.isError) toast.error(updateRole.error?.message ?? "Failed to update role");
  }, [updateRole.isSuccess, updateRole.isError, updateRole.error]);

  React.useEffect(() => {
    if (remove.isSuccess) toast.success("Member removed from workspace");
    if (remove.isError) toast.error(remove.error?.message ?? "Failed to remove user");
  }, [remove.isSuccess, remove.isError, remove.error]);

  const confirmRoleChange = () => {
    if (!pendingChange) return;
    updateRole.mutate({ userId: pendingChange.user.id, role: pendingChange.newRole });
    setPendingChange(null);
  };

  const confirmRemoveUser = () => {
    if (!pendingRemove) return;
    remove.mutate(pendingRemove.id);
    setPendingRemove(null);
  };

  const handleSort = (field: "name" | "role") => {
    if (field === sortField) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredItems = React.useMemo(() => {
    let current = items;
    if (roleFilter !== "ALL") current = current.filter(u => u.role === roleFilter);
    const q = query.trim().toLowerCase();
    if (q) current = current.filter(u => (u.full_name || u.email).toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    return [...current].sort((a, b) => {
      const aVal = sortField === "name" ? (a.full_name || a.email) : a.role;
      const bVal = sortField === "name" ? (b.full_name || b.email) : b.role;
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, query, roleFilter, sortField, sortDir]);

  const roleCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of items) counts[u.role] = (counts[u.role] ?? 0) + 1;
    return counts;
  }, [items]);

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Couldn't load the team. Try refreshing the page."}
        </div>
      </div>
    );
  }

  const isInitialLoad = isLoading && items.length === 0;

  return (
    <ProtectedRoute resource="users">
      <section className="space-y-8">
        <PageHeader
          title="Team Members"
          description="Manage who has access to this workspace and their role."
          actions={
            canManage && (
              <Button onClick={() => setInviteOpen(true)} className="shadow-sm w-full sm:w-auto">
                <UsersIcon className="mr-2 h-4 w-4" /> Invite Member
              </Button>
            )
          }
        />
        <div className="px-6 pb-6 space-y-8">
          {canManage && (
            <div className="rounded-md bg-card p-5 shadow-xs">
              <TeamInvitationsList />
            </div>
          )}
          {!isInitialLoad && items.length > 0 && (
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-3xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-9 bg-background shadow-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRoleFilter("ALL")}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    roleFilter === "ALL"
                      ? "border-foreground/20 bg-foreground/5 text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  All <span className="text-muted-foreground">{items.length}</span>
                </button>
                {ROLE_OPTIONS.map(r =>
                  roleCounts[r] > 0 && (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRoleFilter(roleFilter === r ? "ALL" : r)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                        roleFilter === r
                          ? "border-foreground/20 bg-foreground/5 text-foreground"
                          : "border-transparent text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${ROLE_DOT[r] ?? DEFAULT_ROLE_DOT}`} />
                      {r}
                      <span className="text-muted-foreground">{roleCounts[r]}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
          <TeamMembersTable
            items={items}
            filteredItems={filteredItems}
            isInitialLoad={isInitialLoad}
            currentUserId={currentUserId}
            canManage={canManage}
            query={query}
            roleFilter={roleFilter}
            sortField={sortField}
            sortDir={sortDir}
            onInvite={() => setInviteOpen(true)}
            onSort={handleSort}
            onChangeRole={(user, newRole) => setPendingChange({ user, newRole })}
            onRemove={user => setPendingRemove(user)}
            onClearFilters={() => {
              setQuery("");
              setRoleFilter("ALL");
            }}
          />
          <TeamInviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
          <TeamChangeRoleDialog
            open={!!pendingChange}
            pendingChange={pendingChange}
            onOpenChange={isOpen => { if (!isOpen) setPendingChange(null); }}
            onConfirm={confirmRoleChange}
          />
          <TeamRemoveMemberDialog
            open={!!pendingRemove}
            pendingRemove={pendingRemove}
            onOpenChange={isOpen => { if (!isOpen) setPendingRemove(null); }}
            onConfirm={confirmRemoveUser}
          />
        </div>
      </section>
    </ProtectedRoute>
  );
}
