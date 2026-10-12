import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SettingsSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  placeholder?: string;
  className?: string;
}

export function SettingsSearch({
  query,
  onQueryChange,
  placeholder = "Search settings…",
  className = "",
}: SettingsSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey support: "/" or "Ctrl+K" / "Cmd+K" focuses search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isSlash = e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA";

      if (isCmdK || isSlash) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search settings"
        className="h-9 w-full rounded-lg bg-background pl-8 pr-14 text-xs shadow-none transition-colors focus-visible:ring-1 focus-visible:ring-primary"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 select-none rounded border border-border bg-muted/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      )}
    </div>
  );
}

