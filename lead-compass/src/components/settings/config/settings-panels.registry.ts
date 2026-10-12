import { lazy } from "react";
import type { SettingsPanelComponent, SettingsSectionId } from "../types/settings.types";

export const SETTINGS_PANEL_REGISTRY: Record<
  SettingsSectionId,
  SettingsPanelComponent
> = {
  profile: lazy(() => import("../panels/ProfilePanel")),
  preferences: lazy(() => import("../panels/PreferencesPanel")),
  organization: lazy(() => import("../panels/OrganizationPanel")),
  branding: lazy(() => import("../panels/BrandingPanel")),
  team: lazy(() => import("../panels/TeamPanel")),
  roles: lazy(() => import("../panels/RolesPanel")),
  security: lazy(() => import("../panels/SecurityPanel")),
  notifications: lazy(() => import("../panels/NotificationsPanel")),
  "crm-config": lazy(() => import("../panels/CrmConfigPanel")),
  "lead-settings": lazy(() => import("../panels/LeadSettingsPanel")),
  "contact-settings": lazy(() => import("../panels/ContactSettingsPanel")),
  "deal-settings": lazy(() => import("../panels/DealSettingsPanel")),
  "task-settings": lazy(() => import("../panels/TaskSettingsPanel")),
  "custom-fields": lazy(() => import("../panels/CustomFieldsPanel")),
  automation: lazy(() => import("../panels/AutomationPanel")),
  "email-settings": lazy(() => import("../panels/EmailSettingsPanel")),
  "email-templates": lazy(() => import("../panels/EmailTemplatesPanel")),
  whatsapp: lazy(() => import("../panels/WhatsappPanel")),
  calendar: lazy(() => import("../panels/CalendarPanel")),
  integrations: lazy(() => import("../panels/IntegrationsPanel")),
  ai: lazy(() => import("../panels/AiPanel")),
  data: lazy(() => import("../panels/DataPanel")),
  "import-export": lazy(() => import("../panels/ImportExportPanel")),
  audit: lazy(() => import("../panels/AuditPanel")),
  storage: lazy(() => import("../panels/StoragePanel")),
  billing: lazy(() => import("../panels/BillingPanel")),
  api: lazy(() => import("../panels/ApiPanel")),
  localization: lazy(() => import("../panels/LocalizationPanel")),
  help: lazy(() => import("../panels/HelpPanel")),
  danger: lazy(() => import("../panels/DangerPanel")),
};

export function getSettingsPanelComponent(id: SettingsSectionId): SettingsPanelComponent {
  return SETTINGS_PANEL_REGISTRY[id] ?? SETTINGS_PANEL_REGISTRY.profile;
}

