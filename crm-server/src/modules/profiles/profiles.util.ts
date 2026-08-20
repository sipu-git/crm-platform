export const USER_SELECT = {
    id: true,
    full_name: true,
    company_name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
} as const;

export const TENANT_SELECT = {
    name: true,
    gst_number: true,
    pan_number: true,
    address: true,
    city: true,
    state: true,
    country: true,
    pincode: true,
    website: true,
    logo_url: true,
    industry: true,
    company_size: true,
    status: true,
    created_at: true,
    updated_at: true,
} as const;