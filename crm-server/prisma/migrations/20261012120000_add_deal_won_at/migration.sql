ALTER TABLE "Deal" ADD COLUMN "won_at" TIMESTAMP(3);

UPDATE "Deal" AS d
SET "won_at" = COALESCE(
  (
    SELECT MIN(a."created_at")
    FROM "audits" AS a
    WHERE a."tenant_id" = d."tenant_id"
      AND a."entityId" = d."id"
      AND a."action" = 'deal.won'
  ),
  d."updated_at"
)
FROM "Pipeline" AS p
WHERE d."stage_id" = p."id"
  AND d."tenant_id" = p."tenant_id"
  AND p."is_won" = true;

CREATE INDEX "Deal_tenant_id_won_at_idx" ON "Deal"("tenant_id", "won_at");
