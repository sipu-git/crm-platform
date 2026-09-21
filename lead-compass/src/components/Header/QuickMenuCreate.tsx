// src/features/quick-create/QuickCreateMenu.tsx
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Users, Kanban, ContactRound, Building2, FileText, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermission } from "@/features/auth/hooks/use-permission";

// same `resource` keys as NAV_GROUPS, so visibility stays consistent with the sidebar
const QUICK_CREATE_ITEMS = [
    { to: "leads/new", label: "Lead", icon: Users, resource: "leads" },
    { to: "deals/new", label: "Deal", icon: Kanban, resource: "deals" },
    { to: "contacts/new", label: "Contact", icon: ContactRound, resource: "contacts" },
    { to: "companies/new", label: "Company", icon: Building2, resource: "company" },
    { to: "invoices/new", label: "Invoice", icon: FileText, resource: "invoices" },
    { to: "activities/new", label: "Activity", icon: ListTodo, resource: "activities" },
];

export function QuickCreateMenu() {
    const navigate = useNavigate();
    const { tenantSlug = "" } = useParams();
    const { canSeeModule } = usePermission();

    const visibleItems = QUICK_CREATE_ITEMS.filter((item) => canSeeModule(item.resource));

    if (visibleItems.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Quick create
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <DropdownMenuItem
                            key={item.to}
                            onClick={() => navigate(`/${tenantSlug}/${item.to}`)}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}