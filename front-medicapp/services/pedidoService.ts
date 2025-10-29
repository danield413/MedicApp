// src/services/pedido.service.ts

// Interfaz para el Pedido (lo que recibimos del GET /pendientes)
export interface PedidoPendiente {
  _id: string;
  usuario: {
    nombre: string;
    apellidos: string;
    direccion: string;
  };
  medicamentos: {
    medicamento: {
      nombre: string;
      concentracion: string;
    };
    cantidad: number;
    _id: string;
  }[];
  fechaHora: string;
  direccionEntrega: string;
  total?: number;
}

/**
 * Obtiene los pedidos pendientes (solo para domiciliarios).
 */
export const fetchPedidosPendientes = async (): Promise<PedidoPendiente[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/pendientes`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudo obtener los pedidos');
  }
  return response.json();
};

/**
 * Acepta un pedido (solo para domiciliarios).
 * @param pedidoId - El ID del pedido a aceptar.
 */
export const aceptarPedido = async (pedidoId: string): Promise<any> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/${pedidoId}/aceptar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudo aceptar el pedido');
  }
  return response.json();
};