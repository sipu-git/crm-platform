export interface InvoiceItem {
    id: string;
    invoice_id: string;
    description: string;
    quantity: string;
    unit_price: string;
    discount_amount: string;
    taxable_amount: string;
    tax_rate: string;
    cgst_rate: string;
    cgst_amount: string;
    sgst_rate: string;
    sgst_amount: string;
    igst_rate: string;
    igst_amount: string;
    total_amount: string;
    hsn_code: string | null;
    sac_code: string | null;
    created_at: string;
    updated_at: string;
}

// Request payloads — raw inputs only. taxable_amount/tax amounts/
// total_amount are NEVER sent by the client; the server computes them.
export interface CreateInvoiceItemInput {
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

export interface UpdateInvoiceItemInput {
    description?: string;
    quantity?: number;
    unit_price?: number;
    discount_amount?: number;
    cgst_rate?: number;
    sgst_rate?: number;
    igst_rate?: number;
    hsn_code?: string;
    sac_code?: string;
}

export interface InvoiceItemStates {
    items: InvoiceItem[] | null;
    itemDetail: InvoiceItem | null;
    loading: boolean;
    error: string | null;
}