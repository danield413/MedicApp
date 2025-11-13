// front-medicapp/app/dashboard/pedidos/PedidoForm.tsx
'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PedidoSchema, Pedido } from '@/schema/pedidoSchema';
import { Button, Input, Textarea, Spinner } from '@heroui/react';
import { PlusIcon, TrashIcon } from '@/components/icons';
import { useQuery } from '@tanstack/react-query';
import { getMedicamentos, Medicamento } from '@/services/medicamentoService';

interface PedidoFormProps {
  initialData?: Pedido;
  onSubmit: (data: Pedido) => void;
  isLoading: boolean;
}

// Estilos base para inputs y selects para consistencia
const inputStyles = "block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";

export default function PedidoForm({ initialData, onSubmit, isLoading }: PedidoFormProps) {
  // Cargar medicamentos desde la BD
  const { data: medicamentosDisponibles, isLoading: isLoadingMedicamentos, isError: isErrorMedicamentos } = useQuery<Medicamento[]>({
    queryKey: ['medicamentos'],
    queryFn: getMedicamentos,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Pedido>({
    resolver: zodResolver(PedidoSchema),
    defaultValues: initialData || {
      medicamentos: [{ medicamento: '', cantidad: 1 }],
      direccionEntrega: '',
      observaciones: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicamentos',
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  if (isLoadingMedicamentos) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner color="primary" size="lg" />
        <p className="ml-4 dark:text-gray-300">Cargando medicamentos...</p>
      </div>
    );
  }

  if (isErrorMedicamentos) {
    return (
      <div role="alert" className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
        Error al cargar los medicamentos. Intente de nuevo más tarde.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      
      {/* Sección de Medicamentos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold dark:text-white">Medicamentos</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-start">
            
            <div className="w-full sm:flex-1">
              <label htmlFor={`medicamento-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medicamento</label>
              <select 
                id={`medicamento-${index}`}
                {...register(`medicamentos.${index}.medicamento`)}
                className={inputStyles}
              >
                <option value="">Seleccione...</option>
                {medicamentosDisponibles?.map(med => (
                  <option key={med._id} value={med._id}>
                    {med.nombre} - {med.concentracion} ({med.presentacion})
                  </option>
                ))}
              </select>
              {errors.medicamentos?.[index]?.medicamento && (
                <p className="text-red-500 text-sm mt-1">{errors.medicamentos[index]?.medicamento?.message}</p>
              )}
            </div>

            <div className="w-full sm:w-1/3">
               <Input
                id={`cantidad-${index}`}
                label="Cantidad"
                type="number"
                min="1"
                {...register(`medicamentos.${index}.cantidad`, { valueAsNumber: true })}
                error={errors.medicamentos?.[index]?.cantidad?.message}
              />
            </div>
            
            <div className="pt-0 sm:pt-7">
              <Button 
                type="button"
                variant="text"
                color="danger"
                onClick={() => remove(index)}
                className="!p-2"
                disabled={fields.length === 1}
              >
                <TrashIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
        {errors.medicamentos?.root && (
            <p className="text-red-500 text-sm">{errors.medicamentos.root.message}</p>
        )}
        <Button 
          type="button"
          variant="outline" 
          onClick={() => append({ medicamento: '', cantidad: 1 })}
          startContent={<PlusIcon className="w-4 h-4" />}
        >
          Añadir Medicamento
        </Button>
      </div>

      {/* Sección de Entrega */}
      <Input
        label="Dirección de Entrega"
        {...register('direccionEntrega')}
        error={errors.direccionEntrega?.message}
      />
      
      <Textarea
        label="Observaciones (Opcional)"
        {...register('observaciones')}
        error={errors.observaciones?.message}
      />

      <Button type="submit" color="primary" loading={isLoading} className="w-full">
        {initialData ? 'Actualizar Pedido' : 'Crear Pedido'}
      </Button>
    </form>
  );
}