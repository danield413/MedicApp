'use client';

import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Textarea } from '@heroui/react'; // Textarea para observaciones
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { citaSchema, CitaPayload } from '../../../../schema/citaSchema';
import { addCita } from '../../../../services/citaService'; // Verifica la ruta

function AddCitaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CitaPayload>({
    resolver: zodResolver(citaSchema),
  });

  const onSubmit: SubmitHandler<CitaPayload> = async (data) => {
    setIsSubmitting(true);
    try {
      await addCita(data);
      toast.success('Cita agendada con éxito');
      router.push('/dashboard/recordatorios-citas'); // Volver a la lista de citas
      router.refresh();
    } catch (error: any) {
      toast.error(`Error al agendar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
       <div className="mb-6 flex items-center justify-between">
         <h1 className="text-2xl font-bold dark:text-white">
            Agendar Nueva Cita
         </h1>
         <Link href="/dashboard/citas" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
             &larr; Volver a Mis Citas
         </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <Input
            {...register('especialidad')}
            label="Especialidad *"
            labelPlacement="outside"
            placeholder="Ej: Cardiología, Medicina General"
            isInvalid={!!errors.especialidad}
            errorMessage={errors.especialidad?.message}
            className="w-full mb-10"
          />

          <Input
            {...register('fechaHora')}
            label="Fecha y Hora *"
            type="datetime-local"
            labelPlacement="outside"
            placeholder=" "
            isInvalid={!!errors.fechaHora}
            errorMessage={errors.fechaHora?.message}
            suppressHydrationWarning // Recomendado para inputs de fecha/hora
            className="w-full mb-10"
          />

          <Input
            {...register('lugar')}
            label="Lugar *"
            labelPlacement="outside"
            placeholder="Ej: Hospital San Pedro - Consultorio 301"
            isInvalid={!!errors.lugar}
            errorMessage={errors.lugar?.message}
            className="w-full mb-10"
          />

          <Input
            {...register('nombreDoctor')}
            label="Nombre del Doctor (Opcional)"
            labelPlacement="outside"
            placeholder="Ej: Dr. Andrés Fernández"
            isInvalid={!!errors.nombreDoctor}
            errorMessage={errors.nombreDoctor?.message}
            className="w-full mb-10"
          />

          <Textarea // Usar Textarea para campos más largos
            {...register('observaciones')}
            label="Observaciones (Opcional)"
            labelPlacement="outside"
            placeholder="Ej: Llevar últimos exámenes, Ayuno de 8 horas..."
            isInvalid={!!errors.observaciones}
            errorMessage={errors.observaciones?.message}
            className="w-full mb-10"
            rows={4} // Definir número de filas
          />

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
            <Button
              type="button"
              variant="light" // O 'outline'
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              loading={isSubmitting} // Asumiendo que Button tiene prop loading
              disabled={isSubmitting}
            >
              Agendar Cita
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCitaPage;