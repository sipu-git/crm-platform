// features/activities/activity-form.validation.ts
import { z } from "zod";
import { ACTIVITY_TYPES, ACTIVITY_PRIORITIES } from "@/features/activities/types";

export const activityFormSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional(),
    type: z.enum(ACTIVITY_TYPES),
    priority: z.enum(ACTIVITY_PRIORITIES),
    dueDate: z.string().min(1, "Due date is required"),
    assignedTo: z.string().optional(),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
export type ActivityFormErrors = Partial<Record<keyof ActivityFormValues, string>>;

export const ACTIVITY_FORM_DEFAULTS: ActivityFormValues = {
    title: "",
    description: "",
    type: "TASK",
    priority: "MEDIUM",
    dueDate: "",
    assignedTo: "",
};

export function validateActivityForm(values: ActivityFormValues): ActivityFormErrors {
    const result = activityFormSchema.safeParse(values);
    if (result.success) return {};

    const errors: ActivityFormErrors = {};
    for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ActivityFormValues;
        if (!errors[key]) errors[key] = issue.message;
    }
    return errors;
}