// types/permissions.ts

/**
 * Enum que centraliza todas las acciones de permisos disponibles en el backend.
 * Usar esto en lugar de strings previene errores y facilita el autocompletado.
 */
export enum Permission {
  // Compañía
  COMPANY_CREATE = 'company:create',
  COMPANY_READ_ALL = 'company:read:all',
  COMPANY_UPDATE_ALL = 'company:update:all',
  COMPANY_READ_OWN = 'company:read:own',
  COMPANY_UPDATE_OWN = 'company:update:own',

  // Usuarios
  USER_CREATE = 'user:create',
  USER_READ_COMPANY = 'user:read:company',
  USER_UPDATE_COMPANY = 'user:update:company',

  // Roles
  ROLE_CREATE = 'role:create',
  ROLE_READ_COMPANY = 'role:read:company',
  ROLE_UPDATE_COMPANY = 'role:update:company',

  // Contratos
  CONTRACT_CREATE = 'contract:create',
  CONTRACT_READ_COMPANY = 'contract:read:company',
  CONTRACT_READ_OWN = 'contract:read:own',
  CONTRACT_UPDATE_COMPANY = 'contract:update:company',
  CONTRACT_ASSIGN_USERS = 'contract:assign_users',

  // Informes
  REPORT_CREATE = 'report:create',
  REPORT_READ_COMPANY = 'report:read:company',
  REPORT_READ_OWN = 'report:read:own',
  REPORT_APPROVE = 'report:approve',
}

export interface PermissionEntity {
  id: string;
  action: Permission;
  description?: string;
}
