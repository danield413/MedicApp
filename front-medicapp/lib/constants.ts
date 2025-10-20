// lib/constants.ts

/**
 * Mapeo de valores del enum DocType a texto legible por humanos.
 * Ideal para usar en selects, tablas y vistas de detalle.
 */
export const DOC_TYPE_MAP = {
  CC: 'Cédula de Ciudadanía',
  CE: 'Cédula de Extranjería',
  NIT: 'NIT',
  PPT: 'Permiso por Permanencia Temporal',
  PASSPORT: 'Pasaporte',
} as const;

/**
 * Mapeo de valores del enum PersonType.
 */
export const PERSON_TYPE_MAP = {
  NATURAL: 'Natural',
  JURIDICO: 'Juridico',
} as const;

/**
 * Mapeo de valores del enum CompanyType.
 */
export const COMPANY_TYPE_MAP = {
  PUBLICA: 'Pública',
  PRIVADA: 'Privada',
} as const;

/**
 * Mapeo de roles de usuario dentro de un contrato específico.
 */
export const CONTRACT_ROLE_MAP = {
  SUPERVISOR: 'Supervisor',
  EXPENDITURE_AUTHORIZER: 'Ordenador del Gasto',
} as const;

/**
 * Mapeo de estados de los informes de actividades.
 */
export const REPORT_STATUS_MAP = {
  DRAFT: 'Borrador',
  PENDING_APPROVAL: 'Pendiente de Aprobación',
  REJECTED: 'Rechazado',
  APPROVED: 'Aprobado',
} as const;

/**
 * Mapeo de los slugs de las rutas principales a un formato legible.
 * Perfecto para usar en breadcrumbs, títulos de página, etc.
 */
export const ROUTE_NAME_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  companies: 'Compañías',
  users: 'Usuarios',
  roles: 'Roles y Permisos',
  contractors: 'Contratistas',
  contracts: 'Contratos',
  reports: 'Informes',
  parameters: 'Parámetros',
};

// Puedes agregar más constantes y mapeos aquí a medida que el proyecto crezca.
