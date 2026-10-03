import React, { useState } from "react";
import {
  User, SlidersHorizontal, Building2, Palette, Users, ShieldCheck,
  Lock, Bell, Database, Target, Contact, GitBranch, CheckSquare, LayoutList, Workflow, Mail,
  FileText, MessageCircle, Calendar, Plug, Sparkles, HardDrive, ArrowLeftRight, ScrollText, Cloud, CreditCard, Code2,
  Globe, HelpCircle, AlertTriangle, ChevronRight, Search, Save
} from "lucide-react";
// Import extracted panel components
import ProfilePanel from "@/components/settings/panels/ProfilePanel";
import PreferencesPanel from "@/components/settings/panels/PreferencesPanel";
import OrganizationPanel from "@/components/settings/panels/OrganizationPanel";
import BrandingPanel from "@/components/settings/panels/BrandingPanel";
import TeamPanel from "@/components/settings/panels/TeamPanel";
import RolesPanel from "@/components/settings/panels/RolesPanel";
import SecurityPanel from "@/components/settings/panels/SecurityPanel";
import NotificationsPanel from "@/components/settings/panels/NotificationsPanel";
import CrmConfigPanel from "@/components/settings/panels/CrmConfigPanel";
import LeadSettingsPanel from "@/components/settings/panels/LeadSettingsPanel";
import ContactSettingsPanel from "@/components/settings/panels/ContactSettingsPanel";
import DealSettingsPanel from "@/components/settings/panels/DealSettingsPanel";
// import TaskSettingsPanel from "@/components/settings/panels/TaskSettingsPanel";
import CustomFieldsPanel from "@/components/settings/panels/CustomFieldsPanel";
import AutomationPanel from "@/components/settings/panels/AutomationPanel";
import EmailSettingsPanel from "@/components/settings/panels/EmailSettingsPanel";
import EmailTemplatesPanel from "@/components/settings/panels/EmailTemplatesPanel";
import WhatsappPanel from "@/components/settings/panels/WhatsappPanel";
import CalendarPanel from "@/components/settings/panels/CalendarPanel";
import IntegrationsPanel from "@/components/settings/panels/IntegrationsPanel";
import AiPanel from "@/components/settings/panels/AiPanel";
import DataPanel from "@/components/settings/panels/DataPanel";
import ImportExportPanel from "@/components/settings/panels/ImportExportPanel";
import AuditPanel from "@/components/settings/panels/AuditPanel";
import StoragePanel from "@/components/settings/panels/StoragePanel";
import BillingPanel from "@/components/settings/panels/BillingPanel";
import ApiPanel from "@/components/settings/panels/ApiPanel";
import LocalizationPanel from "@/components/settings/panels/LocalizationPanel";
import HelpPanel from "@/components/settings/panels/HelpPanel";
import DangerPanel from "@/components/settings/panels/DangerPanel";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";

const SECTIONS = [
  { id: "profile", label: "My Profile", icon: User, group: "General" },
  { id: "preferences", label: "Account Preferences", icon: SlidersHorizontal, group: "General" },
  { id: "organization", label: "Organization", icon: Building2, group: "General" },
  { id: "branding", label: "Branding", icon: Palette, group: "General" },
  { id: "team", label: "Team Members", icon: Users, group: "People" },
  { id: "roles", label: "Roles & Permissions", icon: ShieldCheck, group: "People" },
  { id: "security", label: "Security", icon: Lock, group: "People" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "People" },
  { id: "crm-config", label: "CRM Configuration", icon: Database, group: "CRM" },
  { id: "lead-settings", label: "Lead Settings", icon: Target, group: "CRM" },
  { id: "contact-settings", label: "Contact Settings", icon: Contact, group: "CRM" },
  { id: "deal-settings", label: "Deal & Pipeline Settings", icon: GitBranch, group: "CRM" },
  { id: "task-settings", label: "Task & Activity Settings", icon: CheckSquare, group: "CRM" },
  { id: "custom-fields", label: "Custom Fields", icon: LayoutList, group: "CRM" },
  { id: "automation", label: "Workflow Automation", icon: Workflow, group: "CRM" },
  { id: "email-settings", label: "Email Settings", icon: Mail, group: "Communication" },
  { id: "email-templates", label: "Email Templates", icon: FileText, group: "Communication" },
  { id: "whatsapp", label: "WhatsApp Settings", icon: MessageCircle, group: "Communication" },
  { id: "calendar", label: "Calendar Settings", icon: Calendar, group: "Communication" },
  { id: "integrations", label: "Integrations", icon: Plug, group: "System" },
  { id: "ai", label: "AI Settings", icon: Sparkles, group: "System" },
  { id: "data", label: "Data Management", icon: HardDrive, group: "System" },
  { id: "import-export", label: "Import / Export", icon: ArrowLeftRight, group: "System" },
  { id: "audit", label: "Audit Logs", icon: ScrollText, group: "System" },
  { id: "storage", label: "Storage", icon: Cloud, group: "System" },
  { id: "billing", label: "Billing & Subscription", icon: CreditCard, group: "System" },
  { id: "api", label: "API & Developer Settings", icon: Code2, group: "System" },
  { id: "localization", label: "Localization", icon: Globe, group: "System" },
  { id: "help", label: "Help & Support", icon: HelpCircle, group: "System" },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, group: "System" },
];

const GROUPS = ["General", "People", "CRM", "Communication", "System"];

const PANELS: Record<string, React.ComponentType> = {
  profile: ProfilePanel,
  preferences: PreferencesPanel,
  organization: OrganizationPanel,
  branding: BrandingPanel,
  team: TeamPanel,
  roles: RolesPanel,
  security: SecurityPanel,
  notifications: NotificationsPanel,
  "crm-config": CrmConfigPanel,
  "lead-settings": LeadSettingsPanel,
  "contact-settings": ContactSettingsPanel,
  "deal-settings": DealSettingsPanel,
  // "task-settings": TaskSettingsPanel,
  "custom-fields": CustomFieldsPanel,
  automation: AutomationPanel,
  "email-settings": EmailSettingsPanel,
  "email-templates": EmailTemplatesPanel,
  whatsapp: WhatsappPanel,
  calendar: CalendarPanel,
  integrations: IntegrationsPanel,
  ai: AiPanel,
  data: DataPanel,
  "import-export": ImportExportPanel,
  audit: AuditPanel,
  storage: StoragePanel,
  billing: BillingPanel,
  api: ApiPanel,
  localization: LocalizationPanel,
  help: HelpPanel,
  danger: DangerPanel,
};

export default function SettingsPage() {
  const [active, setActive] = useState("profile");
  const [query, setQuery] = useState("");

  const activeSection = SECTIONS.find((s) => s.id === active);
  const Panel = PANELS[active];

  const filtered = query
    ? SECTIONS.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
    : null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title="Settings"
        description="Manage your account, workspace and CRM configuration."
      />

      <Card className="flex items-start px-4 gap-6 rounded-xs">
        {/* Settings nav */}
        <aside className="sticky w-72 shrink-0 overflow-hidden border-r dark:border-slate-700 border-slate-300">
          <div className="border-b dark:border-slate-700 border-slate-300 p-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search settings…"
                className="w-full rounded-lg border dark:border-slate-700 border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <nav className="max-h-[calc(100vh-220px)] overflow-y-auto p-2">
            {(filtered ? [{ group: null, items: filtered }] : GROUPS.map((g) => ({ group: g, items: SECTIONS.filter((s) => s.group === g) }))).map(({ group, items }) => (
              <div key={group ?? "results"} className="mb-1">
                {group && (
                  <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-300">
                    {group}
                  </p>
                )}
                {items.map((s) => {
                  const Icon = s.icon;
                  const isActive = s.id === active;
                  const isDanger = s.id === "danger";
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActive(s.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${isActive
                        ? "bg-indigo-50 font-medium text-indigo-700"
                        : isDanger
                          ? "text-red-500 hover:bg-red-50"
                          : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <Icon size={16} className={isActive ? "text-indigo-600" : isDanger ? "text-red-400" : "text-slate-400"} />
                      <span className="flex-1">{s.label}</span>
                      {isActive && <ChevronRight size={14} className="text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Active panel */}
        <main className="min-w-0 flex-1">
          <div className="my-4 flex items-center gap-2 text-sm text-slate-400">
            <span>Settings</span>
            <ChevronRight size={14} />
            <span className="font-medium dark:text-slate-600 text-slate-300">{activeSection?.label}</span>
          </div>
          <Panel />
        </main>
      </Card>
    </div>
  );
}