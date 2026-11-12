import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

interface DeferredWidgetProps {
  children: ReactNode;
  fallback: ReactNode;
  className?: string;
  onVisible?: () => void;
}

export function DeferredWidget({ children, fallback, className, onVisible }: DeferredWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (isNearViewport) return;

    const container = containerRef.current;
    if (!container) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsNearViewport(true);
      onVisible?.();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          onVisible?.();
          observer.disconnect();
        }
      },
      { rootMargin: "160px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isNearViewport, onVisible]);

  return (
    <div ref={containerRef} className={className}>
      {isNearViewport ? children : fallback}
    </div>
  );
}

export function DeferredChunk({
  children,
  minHeight,
  onVisible,
}: {
  children: ReactNode;
  minHeight: number;
  onVisible?: () => void;
}) {
  const fallback = (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-xl border bg-card/60"
      style={{ minHeight }}
    />
  );

  return (
    <DeferredWidget fallback={fallback} onVisible={onVisible}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </DeferredWidget>
  );
}
