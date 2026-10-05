import { PageHeader } from "@/components/ui-kit";
import { Skeleton } from "@/components/ui/skeleton";

function KpiCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-[220px] w-full rounded-lg" />
      </div>
      <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm lg:col-span-3">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-[220px] w-full rounded-lg" />
      </div>
    </div>
  );
}

function EnquiriesTableSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-10 w-[280px] max-w-full" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-7 gap-4 border-b bg-muted/40 px-4 py-3">
            {["w-20", "w-20", "w-16", "w-16", "w-16", "w-16", "w-20"].map((width, index) => (
              <Skeleton key={index} className={`h-3 ${width}`} />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-7 items-center gap-4 border-b px-4 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function EnquiriesPageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading enquiries">
      <PageHeader
        title="Customer enquiries"
        description="Review incoming demand signals and route the right prospects for approval."
      />
      <div className="space-y-4 p-6">
        <KpiCardsSkeleton />
        <ChartsSkeleton />
        <EnquiriesTableSkeleton />
      </div>
    </div>
  );
}
