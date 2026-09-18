import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchLeadProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchLead({
    value,
    onValueChange,
    placeholder = "Search leads by company, project, or contact",
}: SearchLeadProps) {
    return (
        <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder={placeholder}
                className="h-9 bg-card pl-8 pr-8"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onValueChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}