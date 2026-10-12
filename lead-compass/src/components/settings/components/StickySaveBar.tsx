import { useState } from "react";
import { Save, Loader2, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StickySaveBarProps {
  isDirty?: boolean;
  isSaving?: boolean;
  onSave?: () => Promise<void> | void;
  onDiscard?: () => void;
  sectionTitle?: string;
  className?: string;
}

export function StickySaveBar({
  isDirty = true,
  isSaving: externalIsSaving = false,
  onSave,
  onDiscard,
  sectionTitle,
  className = "",
}: StickySaveBarProps) {
  const [internalSaving, setInternalSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const isSaving = externalIsSaving || internalSaving;

  const handleSave = async () => {
    if (onSave) {
      try {
        setInternalSaving(true);
        await onSave();
        setSavedSuccess(true);
        toast.success(
          sectionTitle
            ? `${sectionTitle} settings saved successfully`
            : "Settings saved successfully",
        );
        setTimeout(() => setSavedSuccess(false), 3000);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save settings",
        );
      } finally {
        setInternalSaving(false);
      }
    } else {
      toast.success("Settings updated successfully");
    }
  };

  return (
    <div
      className={`sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-lg backdrop-blur-md transition-all ${className}`}
      role="region"
      aria-label="Settings save bar"
    >
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {savedSuccess ? (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Changes saved
          </span>
        ) : isDirty ? (
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Unsaved changes in {sectionTitle ?? "this section"}
          </span>
        ) : (
          <span>All changes up to date</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onDiscard && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            className="h-8 gap-1 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Discard
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 gap-1.5 text-xs shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> Save changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

