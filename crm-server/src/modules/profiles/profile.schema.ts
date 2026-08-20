import { z } from "zod";

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const updateProfileSchema = z.object({
    // Personal — any authenticated user may set these
    full_name: z.string().trim().min(1, "Full name is required").max(150).optional(),
    email: z.string().trim().email("Invalid email").max(254).optional(),

    // Workspace/company — OWNER/ADMIN only, enforced in profileService
    name: z.string().trim().min(1).max(200).optional(),
    gst_number: z.string().trim().toUpperCase().regex(gstRegex, "Invalid GST number").optional().or(z.literal("")),
    pan_number: z.string().trim().toUpperCase().regex(panRegex, "Invalid PAN number").optional().or(z.literal("")),
    address: z.string().trim().max(300).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    country: z.string().trim().max(100).optional(),
    pincode: z.string().trim().max(20).optional(),
    website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
    logo_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
    industry: z.string().trim().max(100).optional(),
    company_size: z.string().trim().max(50).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

const USER_FIELDS = ["full_name", "email"] as const;
const TENANT_FIELDS = [
    "name", "gst_number", "pan_number", "address", "city", "state",
    "country", "pincode", "website", "logo_url", "industry", "company_size",
] as const;

export function splitProfileInput(data: UpdateProfileInput) {
    const userFields: Partial<Pick<UpdateProfileInput, typeof USER_FIELDS[number]>> = {};
    const tenantFields: Partial<Pick<UpdateProfileInput, typeof TENANT_FIELDS[number]>> = {};

    for (const key of USER_FIELDS) {
        if (data[key] !== undefined) userFields[key] = data[key] as any;
    }
    for (const key of TENANT_FIELDS) {
        if (data[key] !== undefined) tenantFields[key] = data[key] as any;
    }
    return { userFields, tenantFields };
}

export const deleteProfileSchema = z.object({
    confirm_email: z.string().trim().email(),
});

export type DeleteProfileInput = z.infer<typeof deleteProfileSchema>;