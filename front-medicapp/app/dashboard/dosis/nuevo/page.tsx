'use client';

import React, { useState, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Select, SelectItem, Spinner } from '@heroui/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { dosisSchema, DosisPayload } from '../../../../schema/dosisSchema';
import { addDosis } from '../../../../services/dosisService';
import { fetchMedicamentos, MedicamentoSimple } from '@/services/historialService'; // Reutilizamos el servicio

function AddDosisPage() {
  const router = useRouter();
  const [medicamentos, setMedicamentos] = useState<MedicamentoSimple[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DosisPayload>({
    resolver: zodResolver(dosisSchema),
  });

  useEffect(() => {
    const cargarMedicamentos = async () => {
      setLoadingMeds(true);
      try {
        const meds = await fetchMedicamentos();
        setMedicamentos(meds);
      } catch (error: any) {
        toast.error('Error al cargar medicamentos: ' + error.message);
      } finally {
        setLoadingMeds(false);
      }
    };
    cargarMedicamentos();
  }, []);

  const onSubmit: SubmitHandler<DosisPayload> = async (data) => {
    setIsSubmitting(true);
    try {
      await addDosis(data);
      toast.success('Dosis añadida con éxito');
      router.push('/dashboard/dosis');
      router.refresh();
    } catch (error: any) {
      toast.error(`Error al añadir: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 dark:text-white">
        Agregar Nueva Dosis
      </h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label htmlFor="medicamento" className="block text-sm font-medium mb-1 dark:text-gray-300">Medicamento *</label>
            {loadingMeds ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Spinner size="sm" /> Cargando medicamentos...
              </div>
            ) : (
              <Select
                id="medicamento"
                label="Medicamento *"
                placeholder="Selecciona un medicamento"
                {...register('medicamento')}
                isDisabled={medicamentos.length === 0}
                isInvalid={!!errors.medicamento}
                errorMessage={errors.medicamento?.message}
                className='w-full mb-6'
              >
                {medicamentos.map((med) => (
                  <SelectItem key={med._id} textValue={med.nombre}>
                    {med.nombre} {med.concentracion ? `(${med.concentracion})` : ''}
                  </SelectItem>
                ))}
              </Select>
            )}
          </div>

          <Input
            {...register('descripcion')}
            label="Descripción *"
            labelPlacement="outside"
            placeholder="Ej: 1 tableta después del desayuno"
            isInvalid={!!errors.descripcion}
            errorMessage={errors.descripcion?.message}
            className="w-full"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <Input
              {...register('cantidadDiaria')}
              label="Cantidad Diaria *"
              type="number"
              labelPlacement="outside"
              placeholder="Ej: 2"
              isInvalid={!!errors.cantidadDiaria}
              errorMessage={errors.cantidadDiaria?.message}
              className="w-full"
            />
             <Input
              {...register('unidadMedida')}
              label="Unidad de Medida (Opcional)"
              labelPlacement="outside"
              placeholder="Ej: tabletas, mg, ml"
              isInvalid={!!errors.unidadMedida}
              errorMessage={errors.unidadMedida?.message}
              className="w-full"
            />
          </div>

          <Input
            {...register('frecuencia')}
            label="Frecuencia (Opcional)"
            labelPlacement="outside"
            placeholder="Ej: Cada 8 horas"
            isInvalid={!!errors.frecuencia}
            errorMessage={errors.frecuencia?.message}
            className="w-full"
          />

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
            <Button
              type="button"
              variant="light"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              loading={isSubmitting}
              disabled={isSubmitting || loadingMeds}
            >
              Guardar Dosis
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDosisPage;