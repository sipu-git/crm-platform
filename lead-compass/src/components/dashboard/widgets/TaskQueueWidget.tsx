import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Inbox } from "lucide-react";
import { toast } from "sonner";
import type { TaskItem, WidgetScope } from "@/features/dashboard/dashboard.types";

const PRIORITY_STYLES = {
  HIGH: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/40",
  MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/40",
  LOW: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200/40",
};

const DUE_STYLES = {
  Overdue: "bg-red-500/10 text-red-600 dark:text-red-400 font-semibold",
  Today: "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold",
  Tomorrow: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Upcoming: "bg-muted text-muted-foreground",
};

export function TaskQueueWidget({
  tasks: initialTasks = [],
  isLoading,
  scope,
  showAssignee = false,
}: {
  tasks?: TaskItem[];
  isLoading?: boolean;
  scope?: WidgetScope;
  showAssignee?: boolean;
}) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  if (isLoading) {
    return (
      <Card className="border border-border/60 bg-card shadow-sm h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg border">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const next = !t.completed;
          if (next) toast.success(`Task completed: "${t.title}"`);
          return { ...t, completed: next };
        }
        return t;
      }),
    );
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <Card className="border border-border/70 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Action Queue & Tasks</CardTitle>
            {pendingCount > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <CardDescription className="text-xs">
            {scope === "own"
              ? "Your prioritized action items due today"
              : "Approval requests and team follow-ups"}
          </CardDescription>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <CheckSquare className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 p-0 px-6 pb-4">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
            <Inbox className="h-8 w-8 stroke-[1.5] text-muted-foreground/60" />
            <p className="text-xs font-semibold text-foreground">No pending tasks found</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              You are all caught up! New action items will appear here automatically.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 ${
                task.completed
                  ? "bg-muted/30 border-border/40 opacity-60 line-through"
                  : "bg-card hover:bg-muted/40 border-border/60 hover:border-border"
              }`}
            >
              <div className="pt-0.5">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="rounded-md"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs font-semibold truncate ${
                      task.completed ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </p>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      DUE_STYLES[task.dueLabel] || DUE_STYLES.Upcoming
                    }`}
                  >
                    {task.dueLabel}
                  </span>
                </div>

                {task.description && (
                  <p className="text-[11px] text-muted-foreground truncate">{task.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                  <span className={`px-1.5 py-0.2 rounded border font-medium ${PRIORITY_STYLES[task.priority]}`}>
                    {task.priority}
                  </span>

                  {task.relatedTo && (
                    <span className="text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                      {task.relatedTo.name}
                    </span>
                  )}

                  {showAssignee && task.assigneeName && (
                    <span className="text-muted-foreground ml-auto font-medium">
                      @{task.assigneeName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
