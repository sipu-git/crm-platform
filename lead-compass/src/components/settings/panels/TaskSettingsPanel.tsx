import { Field, SaveBar, SettingsCard, SettingsSelect, ToggleRow } from "../Common";

export default function TaskSettingsPanel() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Task & Activity Settings">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default task priority"><SettingsSelect options={["Low", "Medium", "High"]} /></Field>
          <Field label="Default reminder"><SettingsSelect options={["None", "15 min before", "1 hour before", "1 day before"]} /></Field>
          <Field label="Working hours"><SettingsSelect options={["9:00 – 18:00", "10:00 – 19:00", "Custom"]} /></Field>
          <Field label="Working days"><SettingsSelect options={["Mon–Fri", "Mon–Sat", "All days"]} /></Field>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          <ToggleRow label="Log calls as activities automatically" defaultOn />
          <ToggleRow label="Log emails as activities" defaultOn />
          <ToggleRow label="Mark overdue tasks in red" defaultOn />
        </div>
      </SettingsCard>
      <SaveBar />
    </div>
  );
}
