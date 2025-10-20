// store/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PayloadUser } from '@/types';

/**
 * Define el estado y las acciones para la sesión del usuario autenticado.
 */
interface AuthState extends Omit<PayloadUser, 'permissions' | 'menus'> {
  permissions: Set<string>; // Usamos un Set para búsquedas de permisos más eficientes (O(1)).
  menus: PayloadUser['menus'];
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  setAuthData: (data: PayloadUser | null) => void;
  clearAuthData: () => void;
}

const initialState = {
  id: '',
  name: '',
  email: '',
  companyId: '',
  permissions: new Set<string>(),
  menus: [],
  isAuthenticated: false,
  isSuperAdmin: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      ...initialState,

      /**
       * Acción para poblar el store con los datos del usuario al iniciar sesión.
       * @param data - La información del usuario proveniente de la API.
       */
      setAuthData: data =>
        set({
          ...data,
          permissions: new Set(data?.permissions), // Convertimos el array a Set.
          isAuthenticated: !!data?.id,
          isSuperAdmin: data?.companyId === process.env.NEXT_PUBLIC_SUPER_ADMIN_COMPANY_ID,
        }),

      /**
       * Acción para limpiar el store al cerrar sesión.
       */
      clearAuthData: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage, {
        replacer: (key, value) =>
          key === 'permissions' ? Array.from(value as Set<string>) : value,
        reviver: (key, value) => (key === 'permissions' ? new Set(value as string[]) : value),
      }),
    }
  )
);
