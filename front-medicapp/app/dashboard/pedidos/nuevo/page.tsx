// front-medicapp/app/dashboard/pedidos/nuevo/page.tsx
'use client';

import React from 'react';
import PedidoForm from '../PedidoForm'; // Importamos el formulario reutilizable
import { PedidoSchema } from '@/schema/pedidoSchema';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { crearPedido } from '@/services/pedidoService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/icons'; // Asegúrate de tener este ícono

type PedidoFormData = z.infer<typeof PedidoSchema>;

export default function NuevoPedidoPage() {
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      // Idealmente, mostrar una notificación de éxito (toast)
      router.push('/dashboard/pedidos');
    },
    onError: (error) => {
      // Idealmente, mostrar una notificación de error (toast)
      console.error('Error al crear el pedido:', error);
    },
  });

  const handleSubmit = (data: PedidoFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/dashboard/pedidos" className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold dark:text-white">Crear Nuevo Pedido</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <PedidoForm 
          onSubmit={handleSubmit} 
          isLoading={createMutation.isPending} 
        />
      </div>
    </div>
  );
}