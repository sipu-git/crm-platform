import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input as ShadInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card as ShadCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select as ShadSelect,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge as ShadBadge } from "@/components/ui/badge";
import { Save } from "lucide-react";

/* ── Field wrapper ─────────────────────────────────────────── */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── Input (re-export with no wrapper needed) ──────────────── */
export function SettingsInput(props: React.ComponentProps<"input">) {
  return <ShadInput {...props} />;
}

/* ── Select (thin wrapper over shadcn Radix Select) ────────── */
export function SettingsSelect({
  options,
  defaultValue,
}: {
  options: string[];
  defaultValue?: string;
}) {
  return (
    <ShadSelect defaultValue={defaultValue ?? options[0]}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadSelect>
  );
}

/* ── Toggle row (label + description + Switch) ─────────────── */
export function ToggleRow({
  label,
  desc,
  defaultOn,
}: {
  label: string;
  desc?: string;
  defaultOn?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="cursor-pointer text-sm">
          {label}
        </Label>
        {desc && (
          <p className="text-xs text-muted-foreground">{desc}</p>
        )}
      </div>
      <Switch id={id} defaultChecked={!!defaultOn} />
    </div>
  );
}

/* ── Settings Card (uses shadcn Card) ──────────────────────── */
export function SettingsCard({
  title,
  desc,
  children,
  actions,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <ShadCard>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {desc && <CardDescription>{desc}</CardDescription>}
        </div>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </ShadCard>
  );
}

/* ── Status Badge ──────────────────────────────────────────── */
export function StatusBadge({
  children,
  color = "default",
}: {
  children: React.ReactNode;
  color?:
    | "default"
    | "success"
    | "warning"
    | "destructive"
    | "secondary"
    | "outline";
}) {
  const colorClasses: Record<string, string> = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive:
      "bg-destructive/10 text-destructive border-destructive/20",
    secondary: "bg-secondary text-secondary-foreground border-border",
    outline: "text-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorClasses[color]
      )}
    >
      {children}
    </span>
  );
}

/* ── Save bar (Discard + Save) ─────────────────────────────── */
export function SaveBar() {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button variant="outline">Discard</Button>
      <Button>
        <Save size={16} /> Save changes
      </Button>
    </div>
  );
}

export function Btn({
  children,
  variant = "default",
  size = "sm",
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  variant?: "default" | "outline" | "dangerOutline" | "primary";
  size?: "sm" | "md" | "lg";
}) {
  const variantClasses: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
    dangerOutline:
      "border border-destructive text-destructive hover:bg-destructive/10",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    
  };
  const sizeClasses: Record<string, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-base",
  };
  return (
    <Button
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
// Re-export shadcn primitives for convenience in panels
export { Button, ShadInput as Input, Label, Switch, Separator, ShadBadge as Badge };
export { ShadCard as CardPrimitive, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
