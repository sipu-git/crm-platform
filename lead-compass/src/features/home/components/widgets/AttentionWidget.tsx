import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckSquare,
  CircleDollarSign,
  FileText,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TaskItem } from "@/features/dashboard/types/dashboard.types";
import type { Deal } from "@/features/deals/deal.types";
import type { Invoice } from "@/features/invoices/types/invoices.type";

export const AttentionWidget = React.memo(function AttentionWidget({
  tasks,
  deals,
  invoices,
  unreadEmails,
  isLoading,
  gmailConnected,
  onConnectGmail,
  showTasks,
  showDeals,
  showInvoices,
}: {
  tasks: TaskItem[];
  deals: Deal[];
  invoices: Invoice[];
  unreadEmails: number | null;
  isLoading: boolean;
  gmailConnected: boolean;
  onConnectGmail: () => void;
  showTasks: boolean;
  showDeals: boolean;
  showInvoices: boolean;
}) {
  const now = new Date();
  const upcomingCutoff = new Date(now);
  upcomingCutoff.setDate(upcomingCutoff.getDate() + 7);
  const overdueTasks = tasks.filter((task) => !task.completed && task.dueLabel === "Overdue");
  const followUpDeals = deals.filter((deal) => {
    const closeDate = new Date(deal.expected_close_date);
    return (
      !deal.pipeline?.is_won &&
      !deal.pipeline?.is_lost &&
      closeDate >= now &&
      closeDate <= upcomingCutoff
    );
  });
  const pendingInvoices = invoices.filter((invoice) =>
    ["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status),
  );

  const items = [
    {
      label: "Overdue tasks",
      detail: overdueTasks.length
        ? `${overdueTasks.length} need attention`
        : "You're all caught up",
      count: overdueTasks.length,
      href: "/activities",
      icon: CheckSquare,
      tone: "text-rose-600 bg-rose-500/10",
      visible: showTasks,
    },
    {
      label: "Deals closing soon",
      detail: followUpDeals.length ? "Close date in the next 7 days" : "No deals closing this week",
      count: followUpDeals.length,
      href: "/deals",
      icon: BriefcaseBusiness,
      tone: "text-violet-600 bg-violet-500/10",
      visible: showDeals,
    },
    {
      label: "Pending invoices",
      detail: pendingInvoices.length
        ? "Sent, partially paid, or overdue"
        : "No outstanding invoices",
      count: pendingInvoices.length,
      href: "/invoices",
      icon: FileText,
      tone: "text-amber-600 bg-amber-500/10",
      visible: showInvoices,
    },
  ];

  return (
    <Card className="h-full overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base">Needs your attention</CardTitle>
          <CardDescription className="mt-1 text-xs">
            A short list of items to keep moving today.
          </CardDescription>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <CircleDollarSign className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {items
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 transition-colors hover:bg-muted/60"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${item.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {isLoading ? "Loading your workspace…" : item.detail}
                  </span>
                </span>
                <span className="min-w-7 rounded-full bg-muted px-2 py-1 text-center text-xs font-semibold text-foreground">
                  {isLoading ? "—" : item.count}
                </span>
              </Link>
            );
          })}

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-500/10 text-sky-600">
            <Mail className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-foreground">Unread emails</span>
            <span className="block truncate text-xs text-muted-foreground">
              {gmailConnected ? "Your Gmail inbox" : "Connect Gmail to see new messages"}
            </span>
          </span>
          {gmailConnected ? (
            <>
              <span className="min-w-7 rounded-full bg-muted px-2 py-1 text-center text-xs font-semibold text-foreground">
                {unreadEmails ?? "—"}
              </span>
              <a
                href="https://mail.google.com/mail/u/0/#inbox"
                target="_blank"
                rel="noreferrer"
                aria-label="Open Gmail inbox"
                className="text-muted-foreground hover:text-primary"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={onConnectGmail}
            >
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

