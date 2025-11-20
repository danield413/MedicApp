// src/app/domiciliario/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button, Spinner } from '@heroui/react';
import { fetchPedidosPendientes, aceptarPedido, PedidoPendiente } from '../../../services/pedidoService';
import { useAuthStore } from '@/store/authStore'; // Para mostrar el nombre
import { useAuth } from '@/hooks/auth/useAuth'; // Para el botón de logout
import toast from 'react-hot-toast';

export default function DomiciliarioDashboard() {
  const { handleLogout } = useAuth();
  const usuario = useAuthStore((state) => state.usuario);
  
  const [pedidos, setPedidos] = useState<PedidoPendiente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aceptandoId, setAceptandoId] = useState<string | null>(null); // Para el spinner del botón

  const cargarPedidos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPedidosPendientes();
      setPedidos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const handleAceptarClick = async (pedidoId: string) => {
    setAceptandoId(pedidoId); // Activa el spinner para este botón
    try {
      await aceptarPedido(pedidoId);
      toast.success('¡Pedido aceptado! Tienes un nuevo encargo.');
      // Remover el pedido de la lista local o volver a cargar
      setPedidos(prev => prev.filter(p => p._id !== pedidoId));
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setAceptandoId(null);
    }
  };
  
  // Formateador de fecha
  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));
    } catch { return 'Fecha inválida'; }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Solicitudes Pendientes</h1>
          <p className="text-gray-600 dark:text-gray-300">Hola, {usuario?.nombre || 'Domiciliario'}. Estas son las entregas disponibles.</p>
        </div>
        <Button color="danger" variant="light" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </header>

      {/* Contenido */}
      {isLoading && (
        <div className="flex justify-center py-20"><Spinner color="primary" size="lg" /></div>
      )}
      {error && (
        <div role="alert" className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
          <p className="font-bold">Error al cargar solicitudes</p>
          <p>{error}</p>
        </div>
      )}
      
      {!isLoading && !error && (
        <div>
          {pedidos.length === 0 ? (
            <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400">No hay solicitudes pendientes por el momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pedidos.map((pedido) => (
                <div key={pedido._id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {formatDate(pedido.fechaHora)}
                      </span>
                      {pedido.total && (
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${new Intl.NumberFormat('es-CO').format(pedido.total)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold dark:text-white mb-1">
                      {pedido.usuario.nombre} {pedido.usuario.apellidos}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {pedido.direccionEntrega || pedido.usuario.direccion}
                    </p>
                    <ul className="space-y-1 text-sm dark:text-gray-300">
                      {pedido.medicamentos.map(med => (
                        <li key={med._id}>
                          <strong>{med.cantidad}x</strong> {med.medicamento.nombre} ({med.medicamento.concentracion})
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700">
                    <Button 
                      color="primary" 
                      fullWidth
                      onClick={() => handleAceptarClick(pedido._id)}
                      loading={aceptandoId === pedido._id}
                      disabled={aceptandoId !== null} // Deshabilitar todos los botones mientras se acepta uno
                    >
                      {aceptandoId === pedido._id ? 'Aceptando...' : 'Aceptar Solicitud'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}