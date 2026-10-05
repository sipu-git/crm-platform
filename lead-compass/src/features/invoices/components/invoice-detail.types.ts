export interface BuyerDetailsDraft {
  buyer_name: string;
  buyer_gstin: string;
  buyer_address: string;
  buyer_state: string;
}

export interface SellerDetailsDraft {
  seller_name: string;
  seller_gstin: string;
  seller_address: string;
  seller_state: string;
}

export interface InvoiceMetaDraft {
  notes: string;
  terms: string;
}
