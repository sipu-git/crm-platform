import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FormAlertProps = {
    type: "success" | "error";
    message: string;
    className?: string;
};

export function FormAlert({ type, message, className }: FormAlertProps) {
    const isError = type === "error";

    return (
        <div
            className={cn(
                "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                isError
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
                className
            )}
        >
            {isError ? (
                <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span>{message}</span>
        </div>
    );
}