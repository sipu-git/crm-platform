import { useEffect, useMemo, useState } from "react";
import { Building2, Globe, Plus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCompanies } from "@/features/companies/slice";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";

const statusVariant: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  INACTIVE: "bg-muted text-muted-foreground border-muted-foreground/20",
  PROSPECT: "bg-amber-100 text-amber-700 border-amber-200",
};

export function CompaniesPage() {
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);
  const loading = useAppSelector((state) => state.companies.loading);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { tenantSlug = "" } = useParams();

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  const industries = useMemo(
    () =>
      [...new Set(companies.map((company) => company.industry?.trim()).filter(Boolean) as string[])].sort(),
    [companies]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return companies.filter(
      (company) =>
        (industry === "all" || company.industry === industry) &&
        (!term ||
          [company.name, company.industry, company.website, company.city, company.country]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term)))
    );
  }, [companies, industry, query]);

  const formatLocation = (city?: string | null, country?: string | null) => {
    if (!city && !country) return "—";
    return [city, country].filter(Boolean).join(", ");
  };

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Organizations associated with your leads and customer relationships."
      />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-55 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search company, industry, or location"
              className="h-9 pl-9 bg-background"
            />
          </div>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="h-9 bg-background w-44">
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              {industries.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading && !companies.length && <TableSkeleton />}

        {!loading && !filtered.length && (
          <EmptyState
            title="No companies found"
            description="Try clearing filters or add a company to get started."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New company
              </Button>
            }
          />
        )}

        {!!filtered.length && (
          <div className="overflow-hidden rounded-md border bg-card">
            <div className="overflow-x-auto scroller-hide rounded-lg border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Company</th>
                    <th className="px-3 py-2 font-medium">Industry</th>
                    <th className="px-3 py-2 font-medium">Size</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Location</th>
                    <th className="px-3 py-2 font-medium">Website</th>
                    <th className="px-3 py-2 font-medium">Total leads</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((company) => (
                    <tr
                      key={company.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => navigate(`/${tenantSlug}/company/${company.id}`)}
                    >
                      <td className="px-3 py-3 font-medium">
                        <span className="flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded bg-primary/10 text-primary">
                            <Building2 className="h-4 w-4" />
                          </span>
                          {company.name}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-muted-foreground">
                        {company.industry || "—"}
                      </td>

                      <td className="px-3 py-3 text-muted-foreground">
                        {company.size || "—"}
                      </td>

                      <td className="px-3 py-3">
                        {company.company_status ? (
                          <Badge
                            variant="outline"
                            className={statusVariant[company.company_status] ?? ""}
                          >
                            {company.company_status}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-3 py-3 text-muted-foreground">
                        {formatLocation(company.city, company.country)}
                      </td>

                      <td className="px-3 py-3 text-muted-foreground">
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Globe className="h-3.5 w-3.5" />
                            {company.website.replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* <td className="px-3 py-3 text-muted-foreground">
                        {company.leads?.[0]?.owner_name || "—"}
                      </td> */}

                      <td className="px-3 py-3 font-medium">
                        {company._count?.leads ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
      {/* <CompanyWizardDialog open={createOpen} onOpenChange={setCreateOpen} /> */}
    </div>
  );
}