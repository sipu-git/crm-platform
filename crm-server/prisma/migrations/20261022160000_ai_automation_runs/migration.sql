CREATE TABLE "ai_automation_runs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "run_key" TEXT NOT NULL,
    "workflow" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "result" JSONB,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_automation_runs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_automation_runs_run_key_key" ON "ai_automation_runs"("run_key");
CREATE INDEX "ai_automation_runs_tenant_id_created_at_idx" ON "ai_automation_runs"("tenant_id", "created_at");
CREATE INDEX "ai_automation_runs_tenant_id_status_idx" ON "ai_automation_runs"("tenant_id", "status");
CREATE INDEX "ai_automation_runs_tenant_id_workflow_idx" ON "ai_automation_runs"("tenant_id", "workflow");

ALTER TABLE "ai_automation_runs"
ADD CONSTRAINT "ai_automation_runs_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
