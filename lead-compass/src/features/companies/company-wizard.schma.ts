import { CreateCompanyBody, createCompanySchema } from "./company.validate";

// Step 1 — Basic Info & Identity
export const basicInfoSchema = createCompanySchema.pick({
    name: true,
    legal_name: true,
    industry: true,
    size: true,
    annual_revenue: true,
});

// Step 2 — Contact & Web
export const contactWebSchema = createCompanySchema.pick({
    website: true,
    email: true,
    phone: true,
});

// Step 3 — Physical Address & Location
export const addressSchema = createCompanySchema.pick({
    address_line1: true,
    address_line2: true,
    city: true,
    state: true,
    country: true,
    postal_code: true,
});

// Step 4 — Tax & Statutory Compliance
export const taxComplianceSchema = createCompanySchema.pick({
    gst_number: true,
    pan_number: true,
    place_of_supply: true,
});

// Step 5 — Invoicing & Billing Info
export const billingInfoSchema = createCompanySchema.pick({
    billing_email: true,
    billing_phone: true,
    billing_address: true,
});

// Step 6 — Additional Details & Metadata
export const additionalSchema = createCompanySchema.pick({
    company_status: true,
    source: true,
    tags: true,
});

export const companyStepSchemas = [
    basicInfoSchema,
    contactWebSchema,
    addressSchema,
    taxComplianceSchema,
    billingInfoSchema,
    additionalSchema,
] as const;

export const companyStepMeta = [
    { key: "basic", label: "Basic Info", subtitle: "Core organization identity and size" },
    { key: "contact", label: "Contact & Web", subtitle: "Online presence and primary communication channels" },
    { key: "address", label: "Physical Address", subtitle: "Registered office and headquarters location" },
    { key: "tax", label: "Tax & Statutory Compliance", subtitle: "GSTIN, PAN, and place of supply for invoices" },
    { key: "billing", label: "Billing & Invoicing", subtitle: "Dedicated accounts payable and billing contact details" },
    { key: "additional", label: "Additional & Tags", subtitle: "Lifecycle status, acquisition source, and metadata tags" },
] as const;

export type CompanyStepErrors = Partial<Record<keyof CreateCompanyBody, string>>;

export function validateCompanyStep(
    step: number,
    draft: Partial<CreateCompanyBody>
): { success: boolean; errors: CompanyStepErrors } {
    const schema = companyStepSchemas[step];
    if (!schema) return { success: true, errors: {} };
    
    const result = schema.safeParse(draft);

    if (result.success) return { success: true, errors: {} };

    const errors: CompanyStepErrors = {};
    for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof CreateCompanyBody;
        if (!errors[key]) errors[key] = issue.message;
    }
    return { success: false, errors };
}

// Final safety-net validation before submit
export function validateFullCompany(draft: Partial<CreateCompanyBody>) {
    return createCompanySchema.safeParse(draft);
}