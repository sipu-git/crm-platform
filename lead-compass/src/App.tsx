import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppDispatch } from "@/store/hooks";
import { setCurrentTenant } from "@/features/tenant/slice";
import { LoginPage } from "@/routes/login";
import { ForgotPasswordPage } from "@/routes/forgot-password";
import { AcceptInvitePage } from "@/routes/accept-invite";
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
// import { SettingsPage } from "@/routes/_app.$tenantSlug.settings";
import { LeadDetailPage } from "@/routes/_app.$tenantSlug.lead.$leadId";
import Communications from "@/routes/_app.$tenantSlug.communications.$leadId";
import { CompanyDetailPage } from "./routes/_app.$tenantSlug.company.$companyId";
import ProfilePage from "./routes/_app.$tenantSlug.profiles";
import { ForbiddenPage } from "./routes/forbidden";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import { FullPageSpinner } from "./components/FullPageSpinner";
import { ProjectsPage } from "./routes/_app.$tenantSlug.projects";
import { ClientDashboardPage } from "./routes/_app.$tenantSlug.client-dashboard";
import OwnCompany from "./routes/_app.$tenantSlug.company";
// import { fetchMe } from "@/features/auth/slice";
import { useAuth } from "@/features/auth/hooks/useAuth";
import EnquiriesPage from "./routes/_app.$tenantSlug.enquiries";
import EnquiryDetailPage from "./routes/_app.$tenantSlug.enquiry.$enquiryId";
import TeamPage from "./routes/_app.$tenantSlug.team";
import CalendarPage from "./routes/_app.$tenantSlug.calendar";

function RequireAuth() {
  const { tenantSlug = "acme" } = useParams();
  const dispatch = useAppDispatch();
  const { data: authResult, isLoading, isError } = useAuth();
  const user = authResult?.user;

  useEffect(() => {
    dispatch(setCurrentTenant(tenantSlug));
    // No need to fetchMe; useAuth handles refresh
  }, [dispatch, tenantSlug]);

  if (!localStorage.getItem("crm.auth.token")) return <Navigate to="/login" replace />;
  if (isLoading) return <FullPageSpinner />;
  if (isError || !user) return <Navigate to="/login" replace />;
  return <AppShell tenantSlug={tenantSlug} />;
}

function RoleDashboard() {
  const { data: authResult } = useAuth();
  const role = authResult?.user?.role;
  return role === "CLIENT" ? <ClientDashboardPage /> : <DashboardPage />;
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
    <Route path="/accept-invite" element={<AcceptInvitePage />} />
    <Route path="/reset-password" element={<ForgotPasswordPage />} />
    <Route path="/403" element={<ForbiddenPage />} />
    {/* <Route path="/register" element={<RegisterPage />} /> */}
    <Route path="/:tenantSlug" element={<RequireAuth />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="dashboard" element={<RoleDashboard />} />
      <Route path="leads" element={<ProtectedRoute resource="leads"><LeadsPage /></ProtectedRoute>} />
      <Route path="lead/:leadId" element={<ProtectedRoute resource="leads"><LeadDetailPage /></ProtectedRoute>} />
      <Route path="communications/:leadId" element={<ProtectedRoute resource="communications"><Communications /></ProtectedRoute>} />
      <Route path="contacts" element={<ProtectedRoute resource="contacts"><ContactsPage /></ProtectedRoute>} />
      <Route path="companies" element={<ProtectedRoute resource="company"><CompaniesPage /></ProtectedRoute>} />
      <Route path="company-detail" element={<ProtectedRoute resource="company"><OwnCompany /></ProtectedRoute>} />
      <Route path="company/:companyId" element={<ProtectedRoute resource="company"><CompanyDetailPage /></ProtectedRoute>} />
      <Route path="deals" element={<ProtectedRoute resource="deals"><DealsPage /></ProtectedRoute>} />
      <Route path="deals/:dealId" element={<ProtectedRoute resource="deals"><DealDetail /></ProtectedRoute>} />
      <Route path="activities" element={<ProtectedRoute resource="activities"><ActivitiesPage /></ProtectedRoute>} />
      <Route path="calendar" element={<ProtectedRoute resource="activities"><CalendarPage /></ProtectedRoute>} />
      <Route path="enquires" element={<ProtectedRoute resource="enquires"><EnquiriesPage /></ProtectedRoute>} />
      <Route path="enquires/:id" element={<ProtectedRoute resource="enquires"><EnquiryDetailPage /></ProtectedRoute>} />
      <Route path="projects" element={<ProtectedRoute resource="projects"><ProjectsPage /></ProtectedRoute>} />
      <Route path="invoices" element={<ProtectedRoute resource="invoices"><InvoicesPage /></ProtectedRoute>} />
      <Route path="invoices/:invoiceId" element={<ProtectedRoute resource="invoices"><InvoiceDetail /></ProtectedRoute>} />
      <Route path="teams" element={<ProtectedRoute resource="users"><TeamPage /></ProtectedRoute>} />
      <Route path="notifications" element={<ProtectedRoute resource="notifications"><NotificationsPage /></ProtectedRoute>} />
      <Route path="audit" element={<ProtectedRoute resource="audit"><AuditPage /></ProtectedRoute>} />
      {/* <Route path="settings" element={<InternalRoute><SettingsPage /></InternalRoute>} /> */}
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
