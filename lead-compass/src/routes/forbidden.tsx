import { Link, useLocation } from "react-router-dom";

export function ForbiddenPage() {
    const location = useLocation();
    const message = typeof location.state?.message === "string"
        ? location.state.message
        : "You don't have permission to view this page.";

    return (
        <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
            <h1 className="text-2xl font-semibold">403 — Access denied</h1>
            <p className="text-muted-foreground">
                {message}
            </p>
            <Link to="/" className="text-primary underline">
                Go back home
            </Link>
        </div>
    );
}
