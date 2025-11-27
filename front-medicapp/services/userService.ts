// front-medicapp/services/userService.ts
import { InfoBasica, ResumenMedico } from '@/schema/perfilSchema';
import { IUser } from '@/types/user';

// Interfaz para el resumen médico (lo que recibimos de la API)
export interface IResumenMedico {
  _id: string | null;
  descripcion: string;
  fechaActualizacion?: string;
  usuario?: string;
}

/**
 * Actualiza la información básica del usuario.
 */
export const updateInfoBasica = async (datos: InfoBasica): Promise<IUser> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario/perfil/info-basica`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudo actualizar la información');
  }
  return response.json();
};

/**
 * Actualiza el resumen médico del usuario.
 */
export const updateResumenMedico = async (datos: ResumenMedico): Promise<IResumenMedico> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario/perfil/resumen-medico`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudo actualizar el resumen');
  }
  return response.json();
};

/**
 * Obtiene el resumen médico del usuario.
 */
export const getResumenMedico = async (): Promise<IResumenMedico> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario/perfil/resumen-medico`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
     // Si es 404 (no encontrado), devolvemos uno vacío
     if (response.status === 404) {
        return { _id: null, descripcion: '' };
     }
     throw new Error(errorData.error || 'No se pudo obtener el resumen médico');
  }
  return response.json();
}