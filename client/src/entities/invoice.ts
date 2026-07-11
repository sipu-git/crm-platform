export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  contactId?: string;
  dealId?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  currency?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceInput = Omit<Invoice, "id" | "createdAt" | "updatedAt">;
