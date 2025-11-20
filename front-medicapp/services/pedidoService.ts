// src/services/pedido.service.ts
import { Pedido, PedidoSchema } from '../schema/pedidoSchema';
import { z } from 'zod';

type PedidoCreation = z.infer<typeof PedidoSchema>;
type PedidoUpdate = Partial<PedidoCreation>;

// Interfaz para el Pedido (lo que recibimos del GET /pendientes - Domiciliario)
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

// Interfaz para el Pedido (lo que recibimos del GET /mis-pedidos - Usuario)
export interface IPedidoDetalle {
  _id: string;
  usuario: string; // ID del usuario
  fechaHora: string;
  estadoPedido: 'pendiente' | 'en_preparacion' | 'en_camino' | 'entregado' | 'cancelado';
  medicamentos: {
    medicamento: {
      _id: string;
      nombre: string;
      concentracion?: string;
    };
    cantidad: number;
    _id: string;
  }[];
  domiciliario?: {
    nombre: string;
    apellidos: string;
  };
  direccionEntrega: string;
  total?: number;
  observaciones?: string;
}


// ============================================================================
// FUNCIONES PARA DOMICILIARIOS
// ============================================================================

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

// ============================================================================
// FUNCIONES PARA USUARIOS (Refactorizadas a fetch)
// ============================================================================

/**
 * Obtiene los pedidos del usuario autenticado.
 */
export const getMisPedidos = async (): Promise<IPedidoDetalle[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/mis-pedidos`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudo obtener sus pedidos');
  }
  return response.json();
};

/**
 * Crea un nuevo pedido.
 */
export const crearPedido = async (datosPedido: PedidoCreation): Promise<IPedidoDetalle> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(datosPedido),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudo crear el pedido');
  }
  return response.json();
};

/**
 * Actualiza un pedido existente.
 */
export const actualizarPedido = async (pedidoId: string, datosPedido: PedidoUpdate): Promise<IPedidoDetalle> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/${pedidoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(datosPedido),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudo actualizar el pedido');
  }
  return response.json();
};

/**
 * Cancela un pedido (solo si está pendiente).
 */
export const cancelarPedido = async (pedidoId: string): Promise<IPedidoDetalle> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/${pedidoId}/cancelar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || 'No se pudo cancelar el pedido');
  }
  return response.json();
};