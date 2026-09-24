import z from "zod";
import { Role } from "../../shared/configs/role";

export const inviteUserSchema = z.preprocess(
    (arg: any) => {
        if (typeof arg === "object" && arg !== null) {
            return {
                ...arg,
                full_name: arg.full_name || arg.fullName,
                mobile: arg.mobile || arg.phone,
            };
        }
        return arg;
    },
    z.object({
        full_name: z.string().trim().min(1, "Full name is required"),
        email: z.string().trim().email("Valid email is required"),
        mobile: z.string().trim().min(1, "Mobile number is required"),
        designation: z.string().trim().min(1).optional(),
        role: z.enum(["ADMIN", "MANAGER", "SALES_REP", "FINANCE", "CLIENT"]),
    })
);

export const acceptInviteSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export const updateRoleSchema = z.object({
    role: z.nativeEnum(Role),
});

export const searchPeopleSchema = z.object({
    q: z.string().trim().min(1, "Search query is required"),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type SearchPeopleInput = z.infer<typeof searchPeopleSchema>;

