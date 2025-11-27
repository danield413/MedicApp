// front-medicapp/app/dashboard/pedidos/page.tsx
'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMisPedidos, cancelarPedido, IPedidoDetalle } from '@/services/pedidoService';
import { Button, Spinner } from '@heroui/react';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';

// Componente de mapeo de estado con Tailwind CSS
const EstadoBadge = ({ estado }: { estado: string }) => {
  const colorClasses: { [key: string]: string } = {
    pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    en_preparacion: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    en_camino: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    entregado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[estado] || "bg-gray-100 text-gray-800"}`}>
      {estado.replace('_', ' ')}
    </span>
  );
};

export default function MisPedidosPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: pedidos, isLoading, isError, error } = useQuery<IPedidoDetalle[], Error>({
    queryKey: ['misPedidos'],
    queryFn: getMisPedidos,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misPedidos'] });
      // Aquí podrías añadir una notificación de éxito
    },
    onError: (error) => {
      console.error('Error al cancelar pedido:', error);
      // Aquí podrías añadir una notificación de error
    },
  });

  const handleCancelar = (pedidoId: string) => {
    if (window.confirm('¿Está seguro de que desea cancelar este pedido?')) {
      cancelMutation.mutate(pedidoId);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));
    } catch {
      return 'Fecha inválida';
    }
  };

  console.log('Pedidos cargados:', pedidos);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Mis Pedidos</h1>
        <Link href="/dashboard/pedidos/nuevo">
          <Button color="primary" startContent={<PlusIcon className="w-5 h-5" />}>
            Nuevo Pedido
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Spinner color="primary" size="lg" />
          <p className="ml-4 dark:text-gray-300">Cargando sus pedidos...</p>
        </div>
      )}

      {isError && (
        <div role="alert" className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error?.message || 'Error al cargar los pedidos. Intente de nuevo más tarde.'}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {pedidos?.length === 0 ? (
            <p className="p-6 text-center text-gray-500 dark:text-gray-400">
              No tiene pedidos registrados.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {pedidos?.map((item) => (
                <li key={item._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-start">
                    {/* Columna Fecha y Estado (Móvil) */}
                    <div className="sm:hidden flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.fechaHora)}</span>
                      <EstadoBadge estado={item.estadoPedido} />
                    </div>

                    {/* Columna Fecha (Desktop) */}
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Fecha</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.fechaHora)}</p>
                    </div>

                    {/* Columna Estado (Desktop) */}
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Estado</p>
                      <EstadoBadge estado={item.estadoPedido} />
                    </div>

                    {/* Columna Medicamentos */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Medicamentos</p>
                      <ul className="text-sm text-gray-500 dark:text-gray-400 list-none p-0 m-0">
                        {item.medicamentos.map(med => (
                          <li key={med._id}>{med.medicamento.nombre} (x{med.cantidad})</li>
                        ))}
                      </ul>
                    </div>

                    {/* Columna Dirección */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Dirección</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.direccionEntrega}</p>
                    </div>

                    {/* Columna Domiciliario */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Domiciliario</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.domiciliario ? `${item.domiciliario.nombre} ${item.domiciliario.apellidos}` : 'Sin asignar'}
                      </p>
                    </div>

                    {/* Columna Acciones */}
                    <div className="flex gap-2 justify-end">
                      {item.estadoPedido === 'pendiente' && (
                        <>
                          <button title="Editar Pedido" className="p-1 text-blue-600 hover:text-blue-800" onClick={() => router.push(`/dashboard/pedidos/${item._id}/editar`)}>
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button title="Cancelar Pedido" className="p-1 text-red-600 hover:text-red-800" onClick={() => handleCancelar(item._id)} disabled={cancelMutation.isPending && cancelMutation.variables === item._id}>
                            {cancelMutation.isPending && cancelMutation.variables === item._id ? <Spinner size="sm" /> : <TrashIcon className="w-5 h-5" />}
                          </button>
                        </>
                      )}
                      {/* {item.estadoPedido !== 'pendiente' && (
                        <button title="Ver Detalles" className="p-1 text-gray-500 hover:text-gray-700">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      )} */}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}