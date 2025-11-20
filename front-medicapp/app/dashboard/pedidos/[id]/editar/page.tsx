// front-medicapp/app/dashboard/pedidos/[id]/editar/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMisPedidos, actualizarPedido, IPedidoDetalle } from '@/services/pedidoService';
import PedidoForm from '../../PedidoForm';
import { PedidoSchema } from '@/schema/pedidoSchema';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/icons';
import { Spinner } from '@heroui/react';

type PedidoFormData = z.infer<typeof PedidoSchema>;

export default function EditarPedidoPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const pedidoId = params.id as string;

  // Obtener todos los pedidos del usuario
  const { data: pedidos, isLoading, isError, error } = useQuery<IPedidoDetalle[], Error>({
    queryKey: ['misPedidos'],
    queryFn: getMisPedidos,
  });

  // Buscar el pedido específico
  const pedido = pedidos?.find(p => p._id === pedidoId);

  const updateMutation = useMutation({
    mutationFn: (data: PedidoFormData) => actualizarPedido(pedidoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misPedidos'] });
      router.push('/dashboard/pedidos');
    },
    onError: (error) => {
      console.error('Error al actualizar el pedido:', error);
    },
  });

  const handleSubmit = (data: PedidoFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner color="primary" size="lg" />
        <p className="ml-4 dark:text-gray-300">Cargando pedido...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <Link href="/dashboard/pedidos" className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold dark:text-white">Editar Pedido</h1>
        </div>
        <div role="alert" className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error?.message || 'Error al cargar el pedido. Intente de nuevo más tarde.'}
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <Link href="/dashboard/pedidos" className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold dark:text-white">Editar Pedido</h1>
        </div>
        <div role="alert" className="mb-6 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
          Pedido no encontrado.
        </div>
      </div>
    );
  }

  if (pedido.estadoPedido !== 'pendiente') {
    return (
      <div>
        <div className="flex items-center mb-6">
          <Link href="/dashboard/pedidos" className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold dark:text-white">Editar Pedido</h1>
        </div>
        <div role="alert" className="mb-6 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
          Solo se pueden editar pedidos en estado 'pendiente'.
        </div>
      </div>
    );
  }

  // Preparar datos iniciales para el formulario
  const initialData = {
    medicamentos: pedido.medicamentos.map(med => ({
      medicamento: med.medicamento._id,
      cantidad: med.cantidad,
    })),
    direccionEntrega: pedido.direccionEntrega,
    observaciones: pedido.observaciones || '',
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/dashboard/pedidos" className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold dark:text-white">Editar Pedido</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <PedidoForm 
          initialData={initialData}
          onSubmit={handleSubmit} 
          isLoading={updateMutation.isPending} 
        />
      </div>
    </div>
  );
}