-- Deal-won invoices previously stored the deal total without a line item.
-- Backfill one aggregate project line for those legacy invoices, preserving
-- their existing invoice totals and using the project/enquiry details.
WITH invoices_without_items AS (
  SELECT
    i.*,
    d.title AS deal_title,
    COALESCE(
      NULLIF(BTRIM(project_lead.project_name), ''),
      NULLIF(BTRIM(enquiry.project_name), ''),
      NULLIF(BTRIM(deal_lead.project_name), '')
    ) AS project_name,
    COALESCE(
      NULLIF(BTRIM(project_lead.project_type), ''),
      NULLIF(BTRIM(enquiry.project_type::TEXT), ''),
      NULLIF(BTRIM(deal_lead.project_type), '')
    ) AS project_type
  FROM "Invoice" i
  JOIN "Deal" d
    ON d.id = i.deal_id
   AND d.tenant_id = i.tenant_id
  LEFT JOIN LATERAL (
    SELECT p.*
    FROM "Project" p
    WHERE p.id = i.project_id
       OR p.originating_deal_id = d.id
    ORDER BY (p.id = i.project_id) DESC
    LIMIT 1
  ) project ON TRUE
  LEFT JOIN "Leads" project_lead
    ON project_lead.id = project.originating_lead_id
  LEFT JOIN "Enquiry" enquiry
    ON enquiry.id = project.enquiry_id
  LEFT JOIN "Leads" deal_lead
    ON deal_lead.id = d.lead_id
  WHERE NOT EXISTS (
    SELECT 1
    FROM "InvoiceItem" existing_item
    WHERE existing_item.invoice_id = i.id
  )
)
INSERT INTO "InvoiceItem" (
  id,
  invoice_id,
  description,
  quantity,
  unit_price,
  discount_amount,
  taxable_amount,
  tax_rate,
  cgst_rate,
  cgst_amount,
  sgst_rate,
  sgst_amount,
  igst_rate,
  igst_amount,
  total_amount,
  hsn_code,
  sac_code,
  created_at,
  updated_at
)
SELECT
  MD5(invoice.id || ':deal-invoice-item'),
  invoice.id,
  COALESCE(invoice.project_name, invoice.deal_title)
    || CASE
      WHEN invoice.project_type IS NOT NULL
        THEN ' - ' || REPLACE(invoice.project_type, '_', ' ')
      ELSE ''
    END,
  1,
  invoice.subtotal,
  invoice.discount_amount,
  invoice.taxable_amount,
  CASE WHEN invoice.taxable_amount = 0 THEN 0
    ELSE invoice.tax_amount * 100 / invoice.taxable_amount
  END,
  CASE WHEN invoice.taxable_amount = 0 THEN 0
    ELSE invoice.cgst_amount * 100 / invoice.taxable_amount
  END,
  invoice.cgst_amount,
  CASE WHEN invoice.taxable_amount = 0 THEN 0
    ELSE invoice.sgst_amount * 100 / invoice.taxable_amount
  END,
  invoice.sgst_amount,
  CASE WHEN invoice.taxable_amount = 0 THEN 0
    ELSE invoice.igst_amount * 100 / invoice.taxable_amount
  END,
  invoice.igst_amount,
  invoice.total_amount,
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM invoices_without_items invoice;
