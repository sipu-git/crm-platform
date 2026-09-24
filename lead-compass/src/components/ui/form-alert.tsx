import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import React from "react";

export type FormAlertState = {
  type: "success" | "error";
  message: string;
} | null;

type Props = {
  alert: FormAlertState;
  onDismiss?: () => void;
  className?: string;
};

export function FormAlert({ alert, onDismiss, className = "" }: Props) {
  if (!alert) return null;

  const isSuccess = alert.type === "success";

  return (
    <Alert
      variant={isSuccess ? "default" : "destructive"}
      className={`relative flex items-start gap-2 py-2.5 px-3 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
          : ""
      } ${className}`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      )}
      <AlertDescription className="flex-1 text-sm leading-snug">
        {alert.message}
      </AlertDescription>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </Alert>
  );
}

/** Simple hook to manage FormAlert state alongside useMutation */
export function useFormAlert() {
  const [alert, setAlert] = React.useState<FormAlertState>(null);

  const showSuccess = React.useCallback((message: string) => {
    setAlert({ type: "success", message });
  }, []);

  const showError = React.useCallback((message: string) => {
    setAlert({ type: "error", message });
  }, []);

  const dismiss = React.useCallback(() => setAlert(null), []);

  return { alert, showSuccess, showError, dismiss, setAlert };
}

