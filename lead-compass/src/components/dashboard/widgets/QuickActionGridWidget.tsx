import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  UserPlus,
  CreditCard,
  ShieldCheck,
  Download,
  PhoneCall,
  PlusCircle,
  Calendar,
  Layers,
  FileText,
  IndianRupee,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { DashboardRole, WidgetScope } from "@/features/dashboard/dashboard.types";

interface ActionItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  url?: string;
  actionKey?: string;
}

export function QuickActionGridWidget({
  role,
  scope,
  title = "Quick Actions & Shortcuts",
  subtitle = "Frequently used workflows and operations",
}: {
  role: DashboardRole;
  scope?: WidgetScope;
  title?: string;
  subtitle?: string;
}) {
  const navigate = useNavigate();
  const { tenantSlug=""} = useParams()
  const roleActions: Record<DashboardRole, ActionItem[]> = {
    ADMIN: [
      {
        id: "act-invite",
        label: "Invite Team Member",
        description: "Add new sales reps or finance staff to workspace",
        icon: <UserPlus className="h-4 w-4 text-blue-500" />,
        url: "/teams",
      },
      {
        id: "act-billing",
        label: "Billing & Workspace",
        description: "Manage subscription seats and company profile",
        icon: <CreditCard className="h-4 w-4 text-purple-500" />,
        url: "/settings",
      },
      {
        id: "act-audit",
        label: "Security & Audit Logs",
        description: "Inspect user access and sensitive modification logs",
        icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
        url: "/audit",
      },
      {
        id: "act-export",
        label: "Export Pipeline Report",
        description: "Generate quarterly CSV export of closed deals",
        icon: <Download className="h-4 w-4 text-amber-500" />,
        actionKey: "export",
      },
    ],
    MANAGER: [
      {
        id: "act-reassign",
        label: "Triage & Assign Leads",
        description: "Distribute incoming inbound leads across reps",
        icon: <Layers className="h-4 w-4 text-indigo-500" />,
        url: "/leads",
      },
      {
        id: "act-pipeline-rev",
        label: "Deal Board Review",
        description: "Inspect team Kanban board and stuck deal stages",
        icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
        url: "/deals",
      },
      {
        id: "act-team-goals",
        label: "Set Team Quotas",
        description: "Adjust quarterly targets and sales rep pacing",
        icon: <Sparkles className="h-4 w-4 text-amber-500" />,
        actionKey: "quotas",
      },
      {
        id: "act-broadcast",
        label: "Team Broadcast",
        description: "Send push notification or alert to all reps",
        icon: <Send className="h-4 w-4 text-blue-500" />,
        url: "/notifications",
      },
    ],
    SALES_REP: [
      {
        id: "act-new-deal",
        label: "New Deal Opportunity",
        description: "Create opportunity with value and target stage",
        icon: <PlusCircle className="h-4 w-4 text-emerald-500" />,
        url: "/deals",
      },
      {
        id: "act-log-call",
        label: "Log Call / Meeting",
        description: "Record customer conversation and action items",
        icon: <PhoneCall className="h-4 w-4 text-blue-500" />,
        url: "/activities",
      },
      {
        id: "act-add-lead",
        label: "Add Inbound Lead",
        description: "Capture new prospective lead contact info",
        icon: <UserPlus className="h-4 w-4 text-purple-500" />,
        url: "/leads",
      },
      {
        id: "act-schedule",
        label: "Schedule Follow-up",
        description: "Set reminders for upcoming contract renewals",
        icon: <Calendar className="h-4 w-4 text-amber-500" />,
        url: "/activities",
      },
    ],
    FINANCE: [
      {
        id: "act-new-inv",
        label: "Create New Invoice",
        description: "Issue GST compliant invoice with custom line items",
        icon: <FileText className="h-4 w-4 text-blue-500" />,
        url: "/invoices",
      },
      {
        id: "act-record-pay",
        label: "Record Wire Payment",
        description: "Mark pending invoice as paid upon bank clearance",
        icon: <IndianRupee className="h-4 w-4 text-emerald-500" />,
        url: "/invoices",
      },
      {
        id: "act-reminders",
        label: "Send Bulk Reminders",
        description: "Trigger automated email payment notices to overdue accounts",
        icon: <Send className="h-4 w-4 text-amber-500" />,
        actionKey: "reminders",
      },
      {
        id: "act-tax",
        label: "Export GST Ledger",
        description: "Download monthly sales & tax summary spreadsheet",
        icon: <Download className="h-4 w-4 text-purple-500" />,
        actionKey: "tax_export",
      },
    ],
  };

  const actions = roleActions[role] || roleActions.ADMIN;

  const handleClick = (item: ActionItem) => {
    if (item.url) {
      navigate(`/${tenantSlug}/${item.url}`);
    } else {
      toast.success(`Triggered: ${item.label}`);
    }
  };

  return (
    <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription className="text-xs">{subtitle}</CardDescription>
      </CardHeader>

      <CardContent className="p-0 px-6 pb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleClick(action)}
              className="group flex flex-col justify-between p-3.5 rounded-xl border border-border/60 bg-card hover:bg-muted/40 hover:border-border text-left transition-all duration-150 hover:shadow-xs"
            >
              <div className="flex items-center justify-between w-full">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted/80 group-hover:bg-background border border-border/40 transition-colors">
                  {action.icon}
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
              </div>

              <div className="mt-3 space-y-0.5">
                <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

