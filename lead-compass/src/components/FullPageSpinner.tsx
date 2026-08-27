// src/components/FullPageSpinner.tsx
export function FullPageSpinner() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
                role="status"
                aria-label="Loading"
            />
        </div>
    );
}