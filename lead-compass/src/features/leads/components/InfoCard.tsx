import { ReactNode } from "react";

export interface InfoCardProps {
    title: string;
    icon?: ReactNode;
    description?: string;
    value?: string | number;
    valueLabel?: string;
    className?: string;
    iconClassName?: string;
    onClick?: () => void;
    footer?: ReactNode;
    children?: ReactNode;
}

export default function InfoCard({
    title,
    icon,
    description,
    value,
    valueLabel,
    className = "",
    iconClassName = "",
    onClick,
    footer,
    children,
}: InfoCardProps) {
    const isInteractive = typeof onClick === "function";

    return (
        <div
            onClick={onClick}
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onKeyDown={
                isInteractive
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") onClick?.();
                    }
                    : undefined
            }
            className={[
                "rounded-xl border border-border bg-card p-4 shadow-sm",
                isInteractive
                    ? "cursor-pointer transition hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    {icon && (
                        <span
                            className={[
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-secondary",
                                iconClassName,
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            {icon}
                        </span>
                    )}
                    <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                </div>

                {value !== undefined && (
                    <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{value}</div>
                        {valueLabel && (
                            <div className="text-xs text-gray-500">{valueLabel}</div>
                        )}
                    </div>
                )}
            </div>

            {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}

            {children && <div className="mt-3">{children}</div>}

            {footer && (
                <div className="mt-3 border-t border-gray-100 pt-3">{footer}</div>
            )}
        </div>
    );
}