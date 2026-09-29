"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const SynoraAiButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Open Synora AI assistant"
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full p-px font-medium transition-transform active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        className
      )}
      {...props}
    >
      {/* Animated gradient border background */}
      <span className="absolute inset-0 h-full w-full animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#c084fc_0%,#3b82f6_50%,#c084fc_100%)] opacity-80 transition-opacity group-hover:opacity-100" />
      
      {/* Button content */}
      <span className="relative flex h-full w-full items-center justify-center gap-2 rounded-full bg-slate-950 dark:bg-accent px-4 py-2 transition-colors group-hover:bg-slate-900/90">
        <Sparkles className="h-4 w-4 text-purple-400 transition-transform group-hover:scale-110" />
        <span className="bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-sm font-semibold text-transparent">
          Ask Synora AI
        </span>
      </span>     
    </button>
  );
});
SynoraAiButton.displayName = "SynoraAiButton";