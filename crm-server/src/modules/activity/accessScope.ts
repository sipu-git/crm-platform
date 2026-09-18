import { AccessTokenPayload } from "../../shared/utils/jwt";

export function accessScope(user?: AccessTokenPayload) {
  if (!user || user.role === "ADMIN" || user.role === "MANAGER") return {};
  if (user.role === "SALES_REP") {
    return { OR: [{ assignee: { userId: user.userId } }, { created_by: user.userId }] };
  }
  return { id: "__no_activity_access__" };
}