import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppDispatch } from "@/store/hooks";
import { fetchMe } from "@/features/auth/slice";
import { setCurrentTenant } from "@/features/tenant/slice";
import { LoginPage } from "@/routes/login";
import { RegisterPage } from "@/routes/register";
import { DashboardPage } from "@/routes/_app.$tenantSlug.dashboard";
import { LeadsPage } from "@/routes/_app.$tenantSlug.leads";
import { ContactsPage } from "@/routes/_app.$tenantSlug.contacts";
import { CompaniesPage } from "@/routes/_app.$tenantSlug.companies";
import { DealsPage } from "@/routes/_app.$tenantSlug.deals";
import { DealDetail } from "@/routes/_app.$tenantSlug.deals.$dealId";
import { ActivitiesPage } from "@/routes/_app.$tenantSlug.activities";
import { InvoicesPage } from "@/routes/_app.$tenantSlug.invoices";
import { InvoiceDetail } from "@/routes/_app.$tenantSlug.invoices.$invoiceId";
import { NotificationsPage } from "@/routes/_app.$tenantSlug.notifications";
import { AuditPage } from "@/routes/_app.$tenantSlug.audit";
import { SettingsPage } from "@/routes/_app.$tenantSlug.settings";
import { LeadDetailPage } from "@/routes/_app.$tenantSlug.lead.$leadId";
import Communications from "@/routes/_app.$tenantSlug.communications.$leadId";
import { CompanyDetailPage } from "./routes/_app.$tenantSlug.company.$companyId";

function RequireAuth() {
  const { tenantSlug = "acme" } = useParams();
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(setCurrentTenant(tenantSlug)); dispatch(fetchMe()); }, [dispatch, tenantSlug]);
  if (!localStorage.getItem("crm.auth.token")) return <Navigate to="/login" replace />;
  return <AppShell tenantSlug={tenantSlug} />;
}

function HomeRedirect() {
  const token = localStorage.getItem("crm.auth.token");
  const slug = localStorage.getItem("crm.tenant.slug") || "acme";
  return <Navigate to={token ? `/${slug}/dashboard` : "/login"} replace />;
}

export function App() {
  return <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/:tenantSlug" element={<RequireAuth />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="leads" element={<LeadsPage />} />
      <Route path="lead/:leadId" element={<LeadDetailPage />} />
      <Route path="communications/:leadId" element={<Communications />} />
      <Route path="contacts" element={<ContactsPage />} />
      <Route path="companies" element={<CompaniesPage />} />
      <Route path="company/:companyId" element={<CompanyDetailPage />} />
      <Route path="deals" element={<DealsPage />} />
      <Route path="deals/:dealId" element={<DealDetail />} />
      <Route path="activities" element={<ActivitiesPage />} />
      <Route path="invoices" element={<InvoicesPage />} />
      <Route path="invoices/:invoiceId" element={<InvoiceDetail />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="audit" element={<AuditPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
