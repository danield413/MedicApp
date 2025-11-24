'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Textarea, Spinner } from '@heroui/react';
import { fetchDosis, updateDosis, Dosis } from '../../../../../services/dosisService';
import { getMedicamentos, Medicamento } from '../../../../../services/medicamentoService';
import { useAuth } from '../../../../../hooks/auth/useAuth';

function EditarDosisPage() {
  const router = useRouter();
  const params = useParams();
  const dosisId = params.id as string;

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [formData, setFormData] = useState({
    medicamento: '',
    cantidadDiaria: '',
    descripcion: '',
    frecuencia: '',
    unidadMedida: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  console.log('EditarDosisPage userId:', userId);

  useEffect(() => {
    const cargarDatos = async () => {
      // Validar que userId esté disponible
      if (!userId) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [dosisData, medicamentosData] = await Promise.all([
          fetchDosis(userId),
          getMedicamentos(),
        ]);
        
        const dosisActual = dosisData.find((d: Dosis) => d._id === dosisId);
        
        if (!dosisActual) {
          throw new Error('Dosis no encontrada');
        }

        setFormData({
          medicamento: dosisActual.medicamento?._id || '',
          cantidadDiaria: dosisActual.cantidadDiaria.toString(),
          descripcion: dosisActual.descripcion,
          frecuencia: dosisActual.frecuencia || '',
          unidadMedida: dosisActual.unidadMedida || '',
        });
        
        setMedicamentos(medicamentosData);
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [dosisId, userId]); // Agregar userId como dependencia

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updateDosis(dosisId, {
        medicamento: formData.medicamento,
        cantidadDiaria: parseInt(formData.cantidadDiaria),
        descripcion: formData.descripcion,
        frecuencia: formData.frecuencia,
        unidadMedida: formData.unidadMedida,
      });

      router.push('/dashboard/dosis');
    } catch (err: any) {
      console.error('Error al actualizar dosis:', err);
      setError(err.message || 'Error al actualizar la dosis');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner color="primary" size="lg" />
        <p className="ml-4 dark:text-gray-300">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Editar Dosis</h1>

      {error && (
        <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">
            Medicamento *
          </label>
          <select
            value={formData.medicamento}
            onChange={(e) => setFormData({ ...formData, medicamento: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Seleccionar medicamento</option>
            {medicamentos.map((med) => (
              <option key={med._id} value={med._id}>
                {med.nombre} - {med.concentracion} ({med.presentacion})
              </option>
            ))}
          </select>
        </div>

        <Input
          type="number"
          label="Cantidad Diaria *"
          value={formData.cantidadDiaria}
          onChange={(e) => setFormData({ ...formData, cantidadDiaria: e.target.value })}
          required
          min="1"
        />

        <Input
          label="Unidad de Medida"
          placeholder="tableta(s), ml, etc."
          value={formData.unidadMedida}
          onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
        />

        <Input
          label="Frecuencia"
          placeholder="Cada 8 horas, 3 veces al día, etc."
          value={formData.frecuencia}
          onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
        />

        <Textarea
          label="Descripción *"
          placeholder="Indicaciones adicionales..."
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          required
          minRows={3}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            className="flex-1"
          >
            Actualizar Dosis
          </Button>
          <Button
            type="button"
            color="default"
            variant="flat"
            onPress={() => router.push('/dashboard/dosis')}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditarDosisPage;