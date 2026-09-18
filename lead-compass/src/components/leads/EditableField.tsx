import { useEffect, useRef, type ReactNode } from "react";
import { Check, Pencil, X, Loader2 } from "lucide-react";

interface EditableFieldProps {
    type: "lead" | "contact";
    fieldKey: string;
    label: string;
    icon?: ReactNode;
    value: string | undefined;
    placeholder?: string;
    isEditing: boolean;
    draftValue: string;
    saving: boolean;
    onStartEdit: (type: "lead" | "contact", key: string, currentValue: string) => void;
    onChangeDraft: (v: string) => void;
    onSave: (type: "lead" | "contact", key: string) => void;
    onCancel: () => void;
}

export default function EditableField({
    type,
    fieldKey,
    label,
    icon,
    value,
    placeholder,
    isEditing,
    draftValue,
    saving,
    onStartEdit,
    onChangeDraft,
    onSave,
    onCancel,
}: EditableFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            onSave(type, fieldKey);
        } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5">
                {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
                <input
                    ref={inputRef}
                    type="text"
                    value={draftValue}
                    placeholder={placeholder}
                    disabled={saving}
                    onChange={(e) => onChangeDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
                />
                <div className="flex shrink-0 items-center gap-1">
                    {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <button
                                type="button"
                                aria-label={`Save ${label}`}
                                onClick={() => onSave(type, fieldKey)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                aria-label={`Cancel editing ${label}`}
                                onClick={onCancel}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => onStartEdit(type, fieldKey, value ?? "")}
            className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
        >
            {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
            <span className={`min-w-0 flex-1 truncate text-sm ${value ? "text-foreground" : "text-muted-foreground"}`}>
                {value || placeholder || label}
            </span>
            <Pencil className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
        </button>
    );
}