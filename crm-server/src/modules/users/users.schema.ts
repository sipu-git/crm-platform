import z from "zod";
import { Role } from "../../shared/configs/role";

export const inviteUserSchema = z.object({
    full_name: z.string().min(1),
    email: z.string().email(),
    mobile: z.string().min(1),
    role: z.nativeEnum(Role),
})

export const updateRoleSchema = z.object({
    role: z.nativeEnum(Role),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;