// features/leads/lead.validate.ts
import { z } from "zod";
import { leadValidationMessages as msg } from "./lead.validate-messages";
import { LEAD_SOURCES, LEAD_STATUSES } from "./lead.types";

const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;

export const createLeadSchema = z.object({
    first_name: z.string({ message: msg.first_name.required }).trim().min(1, msg.first_name.required),
    last_name: z.string({ message: msg.last_name.required }).trim().min(1, msg.last_name.required),
    designation: z
        .string({ message: msg.designation.required })
        .trim()
        .min(1, msg.designation.required),
    company_name: z
        .string({ message: msg.company_name.required })
        .trim()
        .min(1, msg.company_name.required),
    // owner_name: z.string({ message: msg.owner_name.required }).trim().min(1, msg.owner_name.required),
    project_name:z.string({message:msg.project_name.required}).trim().min(1,msg.project_name.required),
    project_type: z.string().trim().optional(),
    email: z
        .string({ message: msg.email.required })
        .trim()
        .min(1, msg.email.required)
        .email(msg.email.invalid),
    phone: z
        .string({ message: msg.phone.required })
        .trim()
        .min(1, msg.phone.required)
        .regex(PHONE_REGEX, msg.phone.invalid),
    source: z.enum(LEAD_SOURCES, { message: msg.source.invalid }).default("OTHER"),
});

export const updateLeadStatusSchema = z.object({
    status: z.enum(LEAD_STATUSES, { message: msg.source.invalid }).default("NEW"),
});

export const leadFiltersSchema = z.object({
    status: z.string().optional(),
    source: z.string().optional(),
    assignedTo: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const updateLeadSchema = createLeadSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, { message: msg.form.atLeastOneField });

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFilters = z.infer<typeof leadFiltersSchema>;

export type LeadFormErrors = Partial<Record<keyof CreateLeadInput, string>>;

export function validateLead(draft: Partial<CreateLeadInput>): {
    success: boolean;
    errors: LeadFormErrors;
} {
    const result = createLeadSchema.safeParse(draft);
    if (result.success) return { success: true, errors: {} };

    const errors: LeadFormErrors = {};
    for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof CreateLeadInput;
        if (!errors[key]) errors[key] = issue.message;
    }
    return { success: false, errors };
}