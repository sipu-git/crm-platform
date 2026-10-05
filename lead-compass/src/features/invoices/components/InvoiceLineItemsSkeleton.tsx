import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceLineItemsSkeleton() {
  return (
    <Card>
      <CardContent
        className="space-y-4 py-4"
        aria-label="Loading invoice line items"
        aria-busy="true"
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-2 rounded-md border p-3">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
