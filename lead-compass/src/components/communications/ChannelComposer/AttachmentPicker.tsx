import { Paperclip, X } from "lucide-react";

export function AttachmentPicker({
    attachment,
    onPick,
    onRemove,
}: {
    attachment: File | null;
    onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
}) {
    return (
        <div className="min-w-0">
            <input id="attachment-input" type="file" className="hidden" onChange={onPick} />
            {attachment ? (
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs">
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="max-w-32 truncate">{attachment.name}</span>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Remove attachment"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <label
                    htmlFor="attachment-input"
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                    <Paperclip className="h-3.5 w-3.5" />
                    Attach a file
                </label>
            )}
        </div>
    );
}