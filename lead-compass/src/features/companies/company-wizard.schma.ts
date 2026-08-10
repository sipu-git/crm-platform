import { CreateCompanyBody, createCompanySchema } from "./company.validate";

export const basicInfoSchema = createCompanySchema.pick({
    name: true,
    legal_name: true,
    owner_name: true,
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

// Step 3 — Address
export const addressSchema = createCompanySchema.pick({
    address_line1: true,
    address_line2: true,
    city: true,
    state: true,
    country: true,
    postal_code: true,
});

// Step 4 — Additional Details
export const additionalSchema = createCompanySchema.pick({
    company_status: true,
    source: true,
    tags: true,
    owner_name: true,
});

export const companyStepSchemas = [
    basicInfoSchema,
    contactWebSchema,
    addressSchema,
    additionalSchema,
] as const;

export const companyStepMeta = [
    { key: "basic", label: "Basic Info" },
    { key: "contact", label: "Contact & Web" },
    { key: "address", label: "Address" },
    { key: "additional", label: "Additional" },
] as const;

export type CompanyStepErrors = Partial<Record<keyof CreateCompanyBody, string>>;

export function validateCompanyStep(
    step: number,
    draft: Partial<CreateCompanyBody>
): { success: boolean; errors: CompanyStepErrors } {
    const schema = companyStepSchemas[step];
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