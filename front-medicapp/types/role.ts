// types/role.ts

export interface PermissionPayload {
  id: string;
  action: string;
  description: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  permissions?: PermissionPayload[]; // Los permisos son opcionales y pueden venir anidados
}
