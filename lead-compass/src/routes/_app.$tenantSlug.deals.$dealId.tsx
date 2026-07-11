import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppSelector } from "@/store/hooks";
import { dealsSelectors } from "@/features/deals/slice";
import { invoicesSelectors } from "@/features/invoices/slice";
import { PageHeader } from "@/components/ui-kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/$tenantSlug/deals/$dealId")({
  ssr: false,
  component: DealDetail,
});

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function DealDetail() {
  const { tenantSlug, dealId } = Route.useParams();
  const deal = useAppSelector((s) => dealsSelectors.selectById(s, dealId));
  const invoices = useAppSelector(invoicesSelectors.selectAll).filter(
    (i) => deal && i.clientName === deal.company,
  );

  if (!deal) {
    return (
      <div className="p-6">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/${tenantSlug}/deals`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to deals</Link>
        </Button>
        <div className="mt-6 rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Deal not found. It may have been deleted.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={deal.title}
        description={`${deal.company} • ${fmt(deal.amount)} • Closes ${new Date(deal.closeDate).toLocaleDateString()}`}
        actions={
          <Button asChild variant="outline">
            <Link to={`/${tenantSlug}/deals`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-sm font-medium">Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Company" value={deal.company} />
                <Row label="Amount" value={fmt(deal.amount)} />
                <Row label="Stage" value={<Badge variant="secondary" className="capitalize">{deal.stage}</Badge>} />
                <Row label="Close date" value={new Date(deal.closeDate).toLocaleDateString()} />
                <Row label="Created" value={new Date(deal.createdAt).toLocaleDateString()} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add a note to record next steps, decision-makers, or blockers.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardContent className="space-y-2 py-4 text-sm">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Yesterday</div>
                  <div>Stage moved to {deal.stage}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">3 days ago</div>
                  <div>Deal created</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-4">
            <Card>
              <CardContent className="py-4 text-sm text-muted-foreground">
                No contacts linked to this deal yet.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            <Card>
              <CardContent className="py-2 text-sm">
                {invoices.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">
                    No invoices for this company.
                  </div>
                ) : (
                  <ul className="divide-y">
                    {invoices.map((i) => (
                      <li key={i.id} className="flex items-center justify-between py-2">
                        <span>{i.number}</span>
                        <Badge variant="outline" className="capitalize">{i.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
