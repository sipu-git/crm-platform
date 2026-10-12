import type { ComponentType, LazyExoticComponent } from "react";
import type { LucideIcon } from "lucide-react";

export type SettingsGroup =
  | "General"
  | "People"
  | "CRM"
  | "Communication"
  | "System";

export type SettingsSectionId =
  | "profile"
  | "preferences"
  | "organization"
  | "branding"
  | "team"
  | "roles"
  | "security"
  | "notifications"
  | "crm-config"
  | "lead-settings"
  | "contact-settings"
  | "deal-settings"
  | "task-settings"
  | "custom-fields"
  | "automation"
  | "email-settings"
  | "email-templates"
  | "whatsapp"
  | "calendar"
  | "integrations"
  | "ai"
  | "data"
  | "import-export"
  | "audit"
  | "storage"
  | "billing"
  | "api"
  | "localization"
  | "help"
  | "danger";

export interface SettingsSectionConfig {
  id: SettingsSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
  group: SettingsGroup;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  keywords?: string[];
}

export type SettingsPanelComponent =
  | ComponentType
  | LazyExoticComponent<ComponentType>;

