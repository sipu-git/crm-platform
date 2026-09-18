export type TenantStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED"; // adjust to match your actual TenantStatus enum values

export interface Profile {
    user: {
        id: string;
        full_name: string;
        company_name: string;
        email: string;
        mobile: string;
        role: string;
        createdAt: string;
        updatedAt: string;
    };
    tenant: {
        name: string;
        gst_number: string | null;
        pan_number: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        pincode: string | null;
        website: string | null;
        logo_url: string | null;
        industry: string | null;
        company_size: string | null;
        status: TenantStatus;
        created_at: string;
        updated_at: string;
    };
}

export interface UpdateProfilePayload {
    full_name?: string;
    email?: string;
    mobile?: string;
    name?: string;
    gst_number?: string;
    pan_number?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    website?: string;
    logo_url?: string;
    industry?: string;
    company_size?: string;
}

export interface DeleteProfilePayload {
    confirm_email: string;
}

export interface ApiSuccess<T> {
    success: true;
    message?: string;
    data: T;
}

export type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

export interface ProfileState {
    data: Profile | null;
    fetchStatus: AsyncStatus;
    fetchError: string | null;

    updateStatus: AsyncStatus;
    updateError: string | null;

    deleteStatus: AsyncStatus;
    deleteError: string | null;
}

export const USER_UPDATE_KEYS = ["full_name","email",  "mobile",
] as const satisfies readonly (keyof UpdateProfilePayload & keyof Profile["user"])[];

export const TENANT_UPDATE_KEYS = [
    "name",
    "gst_number",
    "pan_number",
    "address",
    "city",
    "state",
    "country",
    "pincode",
    "website",
    "logo_url",
    "industry",
    "company_size",
] as const satisfies readonly (keyof UpdateProfilePayload & keyof Profile["tenant"])[];

export type UserUpdateKey = (typeof USER_UPDATE_KEYS)[number];
export type TenantUpdateKey = (typeof TENANT_UPDATE_KEYS)[number];