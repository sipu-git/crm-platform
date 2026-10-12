// Settings Module Exports

// Layout & Entry
export { SettingsLayout } from "./layout/SettingsLayout";

// Config & Registry
export { SETTINGS_GROUPS, SETTINGS_SECTIONS, DEFAULT_SETTINGS_SECTION_ID } from "./config/settings-nav.config";
export { SETTINGS_PANEL_REGISTRY, getSettingsPanelComponent } from "./config/settings-panels.registry";

// Components
export { SettingsSidebar } from "./components/SettingsSidebar";
export { SettingsSearch } from "./components/SettingsSearch";
export { SettingsBreadcrumbs } from "./components/SettingsBreadcrumbs";
export { SettingsPanelSkeleton } from "./components/SettingsPanelSkeleton";
export { SettingsErrorBoundary } from "./components/SettingsErrorBoundary";
export { SettingsEmptyState } from "./components/SettingsEmptyState";
export { StickySaveBar } from "./components/StickySaveBar";

// Common UI Primitives
export {
  Field,
  Input,
  SettingsSelect,
  ToggleRow,
  SettingsCard as Card,
  Badge,
  SaveBar,
  Btn,
} from "./Common";

// Types
export type {
  SettingsGroup,
  SettingsSectionId,
  SettingsSectionConfig,
  SettingsPanelComponent,
} from "./types/settings.types";
