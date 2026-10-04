import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const CRMAssistantWidget = React.memo(function CRMAssistantWidget({
  onOpen,
}: {
  onOpen: (prompt?: string) => void;
}) {
  const prompts = [
    "Which deals need a follow-up this week?",
    "Summarize my overdue tasks",
    "Draft a check-in for a client",
  ];

  return (
    <Card className="relative h-full overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-card shadow-sm">
      <div className="pointer-events-none absolute -right-7 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <CardHeader className="relative pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-base">CRM assistant</CardTitle>
            <CardDescription className="mt-1 text-xs">
              A little help with your next move.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onOpen(prompt)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/75 px-3 py-2.5 text-left text-xs text-foreground transition-colors hover:border-primary/30 hover:bg-background"
          >
            <span>{prompt}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        ))}
        <Button className="mt-1 w-full" size="sm" onClick={() => onOpen()}>
          <Sparkles className="mr-2 h-3.5 w-3.5" /> Ask the assistant
        </Button>
      </CardContent>
    </Card>
  );
});

