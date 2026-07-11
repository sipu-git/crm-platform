export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: {
    entity: "contact" | "deal" | "lead" | "invoice";
    event: "created" | "updated" | "status_changed";
  };
  actions: Array<{
    type: "send_email" | "create_task" | "notify" | "update_field";
    config: Record<string, unknown>;
  }>;
  createdAt: string;
  updatedAt: string;
}
