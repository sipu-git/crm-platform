import { InvoiceItem } from "../service1/types";

export const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_TYPES = ["TAX_INVOICE", "PROFORMA", "CREDIT_NOTE"] as const;
export type InvoiceType = (typeof INVOICE_TYPES)[number];
export interface Invoice {
  id: string;
  tenant_id: string;
  invoice_number: string;
  invoice_type: InvoiceType;
  status: InvoiceStatus;
  deal_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  currency: string;
  seller_name: string;
  seller_gstin: string | null;
  seller_address: string | null;
  seller_state: string | null;
  buyer_name: string;
  buyer_gstin: string | null;
  buyer_address: string | null;
  buyer_state: string | null;
  subtotal: string;
  discount_amount: string;
  taxable_amount: string;
  cgst_amount: string;
  sgst_amount: string;
  igst_amount: string;
  tax_amount: string;
  total_amount: string;
  amount_paid: string;
  amount_due: string;
  notes: string | null;
  terms: string | null;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[]; 
}

export interface CreateInvoiceLineItemInput {
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  hsn_code?: string;
  sac_code?: string;
}

export interface CreateInvoiceInput {
  dealId?: string;
  contactId?: string;
  companyId?: string;
  invoice_type: InvoiceType;
  issue_date: string;
  due_date: string;
  currency: string;
  seller_name: string;
  seller_gstin?: string;
  seller_address?: string;
  seller_state?: string;
  buyer_name: string;
  buyer_gstin?: string;
  buyer_address?: string;
  buyer_state?: string;
  notes?: string;
  terms?: string;
  items: CreateInvoiceLineItemInput[];
}

export type UpdateInvoiceInput = Partial<Invoice>;

export interface ListInvoicesQuery {
  dealId?: string;
  contactId?: string;
  companyId?: string;
  status?: InvoiceStatus;
}

export interface InvoiceStates {
  invoices: Invoice[] | null;
  invoiceDetail: Invoice | null;
  loading: boolean;
  error: string | null;
}