// types/auth.ts

/**
 * Estructura del menú de navegación que se recibe del backend.
 */
export interface Menu {
  id: string;
  name: string;
  icon: string;
  parent: string | null;
}

/**
 * Define la carga útil (payload) decodificada del token JWT.
 */
export interface PayloadUser {
  id: string;
  email: string;
  name: string;
  companyId: string;
  permissions: string[];
  menus: Menu[];
}

/**
 * Define la respuesta completa que se recibe al iniciar sesión.
 */
export interface LoginResponse extends PayloadUser {
  // Los tokens son manejados en cookies httpOnly y no son directamente expuestos al cliente.
}
