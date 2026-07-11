import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import type { Tenant, User } from "@/lib/mockDb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/$tenantSlug/settings")({
  ssr: false,
  component: SettingsPage,
});

function SettingsPage() {
  const { tenantSlug } = Route.useParams();
  return (
    <div>
      <PageHeader title="Settings" description="Manage your profile, team, and workspace." />
      <div className="p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="users">Users & roles</TabsTrigger>
            <TabsTrigger value="tenant">Workspace</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-4">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="users" className="mt-4">
            <UsersTab tenantSlug={tenantSlug} />
          </TabsContent>
          <TabsContent value="tenant" className="mt-4">
            <TenantTab tenantSlug={tenantSlug} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProfileTab() {
  const user = useAppSelector((s) => s.auth.user);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);
  return (
    <Card>
      <CardContent className="max-w-lg space-y-3 py-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
      </CardContent>
    </Card>
  );
}

function UsersTab({ tenantSlug }: { tenantSlug: string }) {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    api.get<User[]>(`/${tenantSlug}/users`).then((r) => setUsers(r.data));
  }, [tenantSlug]);

  async function updateRole(id: string, role: User["role"]) {
    await api.patch(`/${tenantSlug}/users/${id}`, { role });
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, role } : x)));
    toast.success("Role updated");
  }

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-3 py-2 font-medium">{u.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
                <td className="px-3 py-2">
                  <Select value={u.role} onValueChange={(v) => updateRole(u.id, v as User["role"])}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="rep">Rep</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function TenantTab({ tenantSlug }: { tenantSlug: string }) {
  const tenant = useAppSelector((s) => s.auth.tenants.find((t) => t.slug === tenantSlug));
  const [name, setName] = useState(tenant?.name || "");
  const [color, setColor] = useState(tenant?.primaryColor || "#4F46E5");
  useEffect(() => {
    setName(tenant?.name || "");
    setColor(tenant?.primaryColor || "#4F46E5");
  }, [tenant]);

  async function save() {
    if (!tenant) return;
    await api.patch(`/tenants/${tenant.id}`, { name, primaryColor: color });
    toast.success("Workspace updated. Reload to see color changes.");
  }

  return (
    <Card>
      <CardContent className="max-w-lg space-y-3 py-4">
        <div className="space-y-1.5">
          <Label>Workspace name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Primary color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-16 rounded-md border bg-transparent"
            />
            <Input value={color} onChange={(e) => setColor(e.target.value)} className="max-w-[140px]" />
          </div>
        </div>
        <Button onClick={save}>Save changes</Button>
      </CardContent>
    </Card>
  );
}
