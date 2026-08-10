import z from "zod";

export const assignSchema = z.object({
    full_name: z.string({ message: "Assignee full name is required!" }),
    designation: z.string({ message: "designation is required!" }),
    department: z.string().optional(),
    userId: z.string().optional(),
})

export const assignParamsSchema = z.object({
    id: z.string({ message: "Lead id requried!" })
})

export type CreateAssignInputs = z.infer<typeof assignSchema>
export type assignParams = z.infer<typeof assignParamsSchema>