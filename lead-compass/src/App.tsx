import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMe } from "@/features/auth/slice";
import { setCurrentTenant } from "@/features/tenant/slice";
import { LoginPage } from "@/routes/login";
import { ForgotPasswordPage } from "@/routes/forgot-password";
// import { RegisterPage } from "@/routes/register";
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
import ProfilePage from "./routes/_app.$tenantSlug.profiles";
import { ForbiddenPage } from "./routes/forbidden";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import { FullPageSpinner } from "./components/FullPageSpinner";
import { TeamPage } from "./routes/_app.$tenantSlug.team";

function RequireAuth() {
  const { tenantSlug = "acme" } = useParams();
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(setCurrentTenant(tenantSlug));
    if (!user && localStorage.getItem("crm.auth.token")) {
      dispatch(fetchMe());
    }
  }, [dispatch, tenantSlug, user]);
  if (!localStorage.getItem("crm.auth.token")) return <Navigate to="/login" replace />;
  if (status === "idle" || status === "loading") return <FullPageSpinner />;
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
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ForgotPasswordPage />} />
    <Route path="/403" element={<ForbiddenPage />} />
    {/* <Route path="/register" element={<RegisterPage />} /> */}
    <Route path="/:tenantSlug" element={<RequireAuth />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="leads" element={<ProtectedRoute resource="leads"><LeadsPage /></ProtectedRoute>} />
      <Route path="lead/:leadId" element={<ProtectedRoute resource="leads"><LeadDetailPage /></ProtectedRoute>} />
      <Route path="communications/:leadId" element={<ProtectedRoute resource="communications"><Communications /></ProtectedRoute>} />
      <Route path="contacts" element={<ProtectedRoute resource="contacts"><ContactsPage /></ProtectedRoute>} />
      <Route path="companies" element={<ProtectedRoute resource="company"><CompaniesPage /></ProtectedRoute>} />
      <Route path="company/:companyId" element={<ProtectedRoute resource="company"><CompanyDetailPage /></ProtectedRoute>} />
      <Route path="deals" element={<ProtectedRoute resource="deals"><DealsPage /></ProtectedRoute>} />
      <Route path="deals/:dealId" element={<ProtectedRoute resource="deals"><DealDetail /></ProtectedRoute>} />
      <Route path="activities" element={<ProtectedRoute resource="activities"><ActivitiesPage /></ProtectedRoute>} />
      <Route path="invoices" element={<ProtectedRoute resource="invoices"><InvoicesPage /></ProtectedRoute>} />
      <Route path="invoices/:invoiceId" element={<ProtectedRoute resource="invoices"><InvoiceDetail /></ProtectedRoute>} />
      <Route path="teams" element={<ProtectedRoute resource="users"><TeamPage /></ProtectedRoute>} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="audit" element={<ProtectedRoute resource="audit"><AuditPage /></ProtectedRoute>} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
