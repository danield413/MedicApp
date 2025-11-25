export interface Medicamento {
  _id: string;
  nombre: string;
  concentracion: string;
  via_administracion: string;
  presentacion: string;
}

/**
 * Obtiene todos los medicamentos disponibles
 */
export const getMedicamentos = async (): Promise<Medicamento[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medicamentos`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudieron obtener los medicamentos');
  }
  return response.json();
};