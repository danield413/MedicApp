import { HistorialConsumoPayload } from '@/schema';

// Define la estructura de un registro de historial (basado en el backend)
// ... (imports, ApiError)

// Interfaz actualizada para coincidir con RegistroConsumo
export interface RegistroConsumo { // Renombrada para claridad
  _id: string;
  medicamento: {
    _id: string;
    nombre: string;
    concentracion?: string; // Hacer opcional si no siempre viene
    presentacion?: string; // Hacer opcional si no siempre viene
  };
  fechaHoraToma: string; // <-- Campo correcto
  descripcion?: string; // <-- Campo correcto (opcional)
  // Ya NO incluye: frecuencia, duracion, recordatorio
}


/**
 * Obtiene el historial de consumo del usuario autenticado.
 */
export const fetchHistorialConsumo = async (): Promise<RegistroConsumo[]> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/historial-consumo', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // ¡Esencial para enviar la cookie de sesión!
  });

  if (!response.ok) {
    // Si falla (ej. no autenticado), lanzamos un error
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' })); // Intenta parsear, si no, error genérico
    throw new Error(errorData.error || 'Error al obtener el historial de consumo');
  }

  return response.json();
};

/**
 * Crea un nuevo registro de historial de consumo.
 * @param data - Los datos del formulario.
 */
export const addHistorialConsumo = async (data: HistorialConsumoPayload): Promise<RegistroConsumo> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/historial-consumo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include', // Para enviar la cookie de sesión
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'Error al agregar el registro de historial de consumo');
  }

  return response.json();
};

// --- Añadir servicio para obtener medicamentos ---
// (Necesario para el dropdown del formulario)

// Define la estructura de un Medicamento (simplificada)
export interface MedicamentoSimple {
  _id: string;
  nombre: string;
  concentracion?: string;
}

/**
 * Obtiene la lista de medicamentos disponibles.
 */
export const fetchMedicamentos = async (): Promise<MedicamentoSimple[]> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/medicamentos', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'Error al obtener la lista de medicamentos');
  }
  return response.json();
}

export const getReporteConsumo = async () => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/historial-consumo/reporte-consumo', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'Error al obtener el reporte de consumo');
  }

  return response.json();
};