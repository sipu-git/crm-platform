import z from "zod";

export const assignSchema = z.object({
    full_name: z.string({ message: "Assignee full name is required!" }).optional(),
    designation: z.string({ message: "designation is required!" }).optional(),
    department: z.string().optional(),
    userId: z.string().optional(),
    email: z.string().optional(),
    assignId: z.string().optional(),
})

export const assignParamsSchema = z.object({
    leadId: z.string({ message: "Lead id required!" })
})


export type CreateAssignInputs = z.infer<typeof assignSchema>
export type assignParams = z.infer<typeof assignParamsSchema>
