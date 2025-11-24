import { CitaPayload } from '../schema/citaSchema';

// Interfaz para una Cita (lo que recibimos del GET)
export interface Cita {
  _id: string;
  usuario: string; // ID del usuario
  especialidad: string;
  fechaHora: string; // Viene como string ISO del backend
  lugar: string;
  nombreDoctor?: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Revisa tu archivo .env para la URL base de la API
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/citas`;

/**
 * Obtiene las citas del usuario autenticado.
 */
export const fetchCitas = async (): Promise<Cita[]> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Para enviar la cookie de sesión
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudieron obtener las citas');
  }
  return response.json();
};

/**
 * Crea una nueva cita para el usuario.
 * @param data - Los datos del formulario de cita.
 */
export const addCita = async (data: CitaPayload): Promise<Cita> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include', // Para enviar la cookie de sesión
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudo crear la cita');
  }
  return response.json();
};


export const updateCita = async (id: string, data: Partial<Cita>): Promise<Cita> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include', // Para enviar la cookie de sesión
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al actualizar la cita');
  }

  return response.json();
};