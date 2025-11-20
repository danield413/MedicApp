import { DosisPayload } from '../schema/dosisSchema'

// Interfaz para una Dosis (lo que recibimos del GET)
export interface Dosis {
  _id: string;
  medicamento: {
    _id: string;
    nombre: string;
    concentracion?: string;
    presentacion?: string;
  };
  cantidadDiaria: number;
  descripcion: string;
  unidadMedida?: string;
  frecuencia?: string;
  createdAt?: string; // añadido por timestamps
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/dosis`; // URL del nuevo endpoint

/**
 * Obtiene las dosis del usuario autenticado.
 */
export const fetchDosis = async (): Promise<Dosis[]> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudieron obtener las dosis');
  }
  return response.json();
};

/**
 * Crea una nueva dosis para el usuario.
 * @param data - Los datos del formulario de dosis.
 */
export const addDosis = async (data: DosisPayload): Promise<Dosis> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudo agregar la dosis');
  }
  return response.json();
};