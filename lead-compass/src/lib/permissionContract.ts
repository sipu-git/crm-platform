export {
  APP_ROLES,
  REGISTERED_PERMISSIONS,
  ROLE_PERMISSIONS,
  getRolePermissions,
  hasPermission,
  hasResourcePermission,
  isAppRole,
  isRegisteredPermission,
} from "../../../crm-server/src/modules/rbac/permission-contract.ts";
export type {
  AppRole,
  Permission,
} from "../../../crm-server/src/modules/rbac/permission-contract.ts";
