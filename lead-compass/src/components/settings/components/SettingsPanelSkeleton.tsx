import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SettingsPanelSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading settings section">
      {/* Top Header Card Skeleton */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader className="space-y-2 pb-4">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar / Photo row skeleton */}
          <div className="flex items-center gap-4 py-2">
            <Skeleton className="h-16 w-16 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-32 rounded-md" />
              <Skeleton className="h-3 w-40 rounded-md" />
            </div>
          </div>
          {/* Form grid skeleton */}
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Second Card Skeleton */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader className="space-y-2 pb-4">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-3 w-56 rounded-md" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border/40">
            <div className="space-y-1">
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-3 w-60 rounded-md" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Bar Skeleton */}
      <div className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    </div>
  );
}

