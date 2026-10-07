import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";

import { FullPageSpinner } from "@/components/FullPageSpinner";
import { ProtectedRoute } from "@/components/ProtectedRoutes";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentTenant } from "@/features/tenant/slice";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfile } from "@/features/profiles/hooks/useProfile";
import AppShell from "./components/AppShell";

const LoginPage = lazy(() => import("@/features/auth/routes/login"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/routes/forgot-password"));
const AcceptInvitePage = lazy(() => import("@/features/users/routes/accept-invite"));
const SignupWizard = lazy(() => import("@/features/auth/components/SignupWizard"));
const HomePage = lazy(() => import("@/features/home/routes/HomePage"));
const DashboardPage = lazy(() =>import("@/features/dashboard/routes/_app.$tenantSlug.dashboard"));
const ClientDashboardPage = lazy(() =>import("@/features/dashboard/routes/_app.$tenantSlug.client-dashboard"));
const ProfilePage = lazy(() => import("@/features/profiles/routes/_app.$tenantSlug.profiles"));
const LeadsPage = lazy(() => import("@/features/leads/routes/_app.$tenantSlug.leads"));
const LeadDetailPage = lazy(() =>import("@/features/leads/routes/_app.$tenantSlug.lead.$leadId"));
const Communications = lazy(() =>import("@/features/communications/routes/_app.$tenantSlug.communications.$leadId"));
const ContactsPage = lazy(() =>import("@/features/contacts/routes/_app.$tenantSlug.contacts"));
const CompaniesPage = lazy(() =>import("@/features/companies/routes/_app.$tenantSlug.companies"));
const OwnCompany = lazy(() =>import("@/features/companies/routes/_app.$tenantSlug.company"));
const CompanyDetailPage = lazy(() =>import("@/features/companies/routes/_app.$tenantSlug.company.$companyId"));
const DealsPage = lazy(() => import("@/features/deals/routes/_app.$tenantSlug.deals"));
const DealDetail = lazy(() =>import("@/features/deals/routes/_app.$tenantSlug.deals.$dealId"));
const ActivitiesPage = lazy(() =>import("@/features/activities/routes/_app.$tenantSlug.activities"));
const CalendarPage = lazy(() =>import("@/features/calendar/routes/_app.$tenantSlug.calendar"));
const EnquiriesPage = lazy(() =>import("@/features/enquiries/routes/_app.$tenantSlug.enquiries"));
const EnquiryDetailPage = lazy(() =>import("@/features/enquiries/routes/_app.$tenantSlug.enquiry.$enquiryId"));
const ProjectsPage = lazy(() =>import("@/features/projects/routes/_app.$tenantSlug.projects"));
const InvoicesPage = lazy(() =>import("@/features/invoices/routes/_app.$tenantSlug.invoices"));
const InvoiceDetail = lazy(() =>import("@/features/invoices/routes/_app.$tenantSlug.invoices.$invoiceId"));
const TeamPage = lazy(() => import("@/features/users/routes/_app.$tenantSlug.team"));
const NotificationsPage = lazy(() =>import("@/features/notifications/routes/_app.$tenantSlug.notifications"));
const AuditPage = lazy(() => import("@/features/audit/routes/_app.$tenantSlug.audit"));
const SettingsPage = lazy(() => import("@/routes/_app.$tenantSlug.settings"));
const ForbiddenPage = lazy(() => import("@/routes/forbidden"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));

function RequireAuth() {
  const { tenantSlug = "acme" } = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const storedTenantSlug = useAppSelector((state) => state.tenant.currentSlug);

  const {data: authResult,isLoading,isError} = useAuth();
  const user = authResult?.user;
  const { data: profile, isLoading: isProfileLoading } = useProfile(Boolean(user));
  const tenant = profile?.tenant ?? authResult?.tenant;

  useEffect(() => {
    if (!tenant?.tenant_key) return;

    dispatch(setCurrentTenant({
      tenantKey: tenant.tenant_key,
      ...(tenant.slug !== undefined ? { slug: tenant.slug } : {}),
      ...(tenant.name !== undefined ? { name: tenant.name } : {}),
    }));
  }, [dispatch, tenant?.tenant_key, tenant?.slug, tenant?.name]);

  if (!localStorage.getItem("crm.auth.token")) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || (Boolean(user) && isProfileLoading)) {
    return <FullPageSpinner />;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  const canonicalTenantSlug = tenant?.slug || storedTenantSlug;
  if (canonicalTenantSlug && tenantSlug !== canonicalTenantSlug) {
    const routePrefix = `/${tenantSlug}`;
    const routeSuffix = location.pathname.startsWith(`${routePrefix}/`)
      ? location.pathname.slice(routePrefix.length)
      : "/home";
    return (
      <Navigate
        to={`/${canonicalTenantSlug}${routeSuffix}${location.search}${location.hash}`}
        replace
      />
    );
  }

  return <AppShell tenantSlug={tenantSlug} tenant={profile?.tenant} />;
}

function RoleDashboard() {
  const { data: authResult } = useAuth();

  const role = authResult?.user?.role;

  return role === "CLIENT" ? (
    <ClientDashboardPage />
  ) : (
    <DashboardPage />
  );
}

function RoleHome() {
  const { data: authResult } = useAuth();

  return authResult?.user?.role === "CLIENT" ? (
    <ClientDashboardPage />
  ) : (
    <HomePage />
  );
}

function HomeRedirect() {
  const token = localStorage.getItem("crm.auth.token");

  const slug =
    localStorage.getItem("crm.tenant.slug") || "acme";

  return (
    <Navigate
      to={token ? `/${slug}/home` : "/login"}
      replace
    />
  );
}

export function App() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupWizard />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        <Route path="/reset-password" element={<ForgotPasswordPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        <Route path="/:tenantSlug" element={<RequireAuth />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<RoleHome />} />
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
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
