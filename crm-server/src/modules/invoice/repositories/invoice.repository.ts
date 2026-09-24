import { InvoiceStatus } from "../../../../generated/prisma/enums";
import { ApiError } from "../../../shared/utils/ApiError";
import { AccessTokenPayload } from "../../../shared/utils/jwt";
import { PrismaClientTx } from "../../../shared/utils/prisma.types";
import { buildOwnershipFilter } from "../../rbac/scope";
import { generateInvoiceNumber, InvoiceHeaderInput, InvoiceUpdatableFields } from "../utils/invoice.calculation";

export const invoiceRepository = {
  findMany(tx: PrismaClientTx, tenantId: string, user: AccessTokenPayload,
    status?: InvoiceStatus, dealId?: string
  ) {
    const ownershipFilter = buildOwnershipFilter(user, "invoices");
    return tx.invoice.findMany({
      where: {
        tenant_id: tenantId,
        ...ownershipFilter,
        ...(status ? { status } : {}),
        ...(dealId ? { deal_id: dealId } : {}),
      },
      orderBy: { created_at: "desc" },
      include: { deal: true, items: true },
    });
  },
  
  async findOwnInvoice(tx: PrismaClientTx, tenantId: string, userId: string) {
    const user = await tx.user.findFirst({
      where: { id: userId },
      select: { email: true, company_id: true },
    });
    if (!user) return [];

    const conditions: Record<string, unknown>[] = [];
    if (user.company_id) {
      conditions.push({ company_id: user.company_id });
    }
    if (user.email) {
      conditions.push({ contact: { email: user.email } });
    }
    conditions.push({ project: { members: { some: { user_id: userId, tenant_id: tenantId } } } });

    return tx.invoice.findMany({
      where: {
        tenant_id: tenantId,
        OR: conditions,
      },
      include: { deal: true, items: true },
    });
  },

  async findById(tx: PrismaClientTx, tenantId: string, id: string, dealId?: string, user?: AccessTokenPayload) {
    const invoice = await tx.invoice.findFirst({
      where: { id, tenant_id: tenantId, ...(user ? buildOwnershipFilter(user, "invoices") : {}) },
      include: { deal: true, items: true, project: true },
    });

    if (!invoice) return null;

    // If seller details are missing on a DRAFT invoice, auto-fill from the latest workspace profile
    if (invoice.status === "DRAFT" && (!invoice.seller_gstin || !invoice.seller_address || !invoice.seller_state)) {
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      if (tenant) {
        const addressParts = [tenant.address, tenant.city, tenant.pincode, tenant.country].filter(Boolean);
        const formattedAddress = addressParts.length > 0 ? addressParts.join(", ") : tenant.address;

        return {
          ...invoice,
          seller_name: invoice.seller_name || tenant.name,
          seller_gstin: invoice.seller_gstin || tenant.gst_number,
          seller_address: invoice.seller_address || formattedAddress,
          seller_state: invoice.seller_state || tenant.state,
        };
      }
    }

    return invoice;
  },

  async createDraftFromDeal(tx: PrismaClientTx, tenantId: string, dealId: string, amount: number, dueDate: Date) {

    const deal = await tx.deal.findUnique({
      where: {
        id: dealId,
      },
      include: {
        leads: {
          include: {
            company: true
          }
        }
      }
    });

    if (!deal) {
      throw new Error("Deal not found");
    }

    const existing = await tx.invoice.findFirst({ where: { deal_id: dealId, tenant_id: tenantId, status: 'DRAFT' } });
    if (existing) {
      throw ApiError.badRequest('Invoice already exists');
    }

    // Get seller information from workspace profile (Tenant) and user
    const [tenant, sellerUser] = await Promise.all([
      tx.tenant.findUnique({ where: { id: tenantId } }),
      tx.user.findFirst({ where: { tenantId: tenantId } }),
    ]);

    const sellerName = tenant?.name || sellerUser?.company_name || "Workspace";
    const sellerAddressParts = [tenant?.address, tenant?.city, tenant?.pincode, tenant?.country].filter(Boolean);
    const sellerAddress = sellerAddressParts.length > 0 ? sellerAddressParts.join(", ") : (tenant?.address || null);
    const sellerGstin = tenant?.gst_number || null;
    const sellerState = tenant?.state || null;

    const companyDetail = deal.leads?.company_name || deal.leads?.company?.name;

    if (!companyDetail) {
      throw new Error("Buyer company not found for this deal");
    }

    const buyerCompany = deal.leads?.company;
    const buyerGstin = buyerCompany?.gst_number || null;
    const buyerAddressParts = [
      buyerCompany?.address_line1,
      buyerCompany?.address_line2,
      buyerCompany?.city,
      buyerCompany?.postal_code,
      buyerCompany?.country,
    ].filter(Boolean);
    const buyerAddress = buyerCompany?.billing_address || (buyerAddressParts.length > 0 ? buyerAddressParts.join(", ") : null);
    const buyerState = buyerCompany?.place_of_supply || buyerCompany?.state || null;

    const invoice_number = await generateInvoiceNumber(tx, tenantId, companyDetail);

    return tx.invoice.create({
      data: {
        tenant_id: tenantId,
        invoice_number,
        invoice_type: "B2B",
        status: "DRAFT",
        deal_id: deal.id,
        contact_id: deal.contact_id || null,
        company_id: deal.leads?.companyId || null,
        issue_date: new Date(),
        due_date: dueDate,
        currency: "INR",
        // Seller details from workspace profile
        seller_name: sellerName,
        seller_gstin: sellerGstin,
        seller_address: sellerAddress,
        seller_state: sellerState,
        // Buyer details from company profile
        buyer_name: companyDetail,
        buyer_gstin: buyerGstin,
        buyer_address: buyerAddress,
        buyer_state: buyerState,
        subtotal: amount,
        discount_amount: 0,
        taxable_amount: amount,

        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        tax_amount: 0,

        total_amount: amount,
        amount_paid: 0,
        amount_due: amount,
      },
    });
  },
  update(tx: PrismaClientTx, id: string, data: Partial<InvoiceUpdatableFields>) {
    return tx.invoice.update({
      where: { id },
      data,
    });
  },

  updateTotals(tx: PrismaClientTx, id: string, totals: {
    subtotal: number;
    discount_amount: number;
    taxable_amount: number;
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    tax_amount: number;
    total_amount: number;
    amount_due: number;
  }
  ) {
    return tx.invoice.update({
      where: { id },
      data: totals,
    });
  },

  recordPayment(tx: PrismaClientTx, id: string, amountPaid: number, amountDue: number, paidAt: Date,
    newStatus: InvoiceStatus
  ) {
    return tx.invoice.update({
      where: { id },
      data: {
        amount_paid: { increment: amountPaid },
        amount_due: amountDue,
        paid_at: paidAt,
        status: newStatus,
      },
    });
  },

  delete(tx: PrismaClientTx, tenantId: string, id: string) {
    return tx.invoice.delete({
      where: {
        tenant_id: tenantId,
        id
      },
    });
  },
};
