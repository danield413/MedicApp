'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Textarea, Spinner, Select, SelectItem } from '@heroui/react';
import { fetchCitas, Cita, updateCita } from '../../../../../services/citaService';

const estadosCita = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'completada', label: 'Completada' },
];

function EditarCitaPage() {
  const router = useRouter();
  const params = useParams();
  const citaId = params.id as string;

  const [formData, setFormData] = useState({
    especialidad: '',
    fechaHora: '',
    lugar: '',
    nombreDoctor: '',
    estado: 'pendiente',
    observaciones: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarCita = async () => {
      try {
        const citas = await fetchCitas();
        const citaActual = citas.find((c: Cita) => c._id === citaId);
        
        if (!citaActual) {
          throw new Error('Cita no encontrada');
        }

        // Formatear fecha para input datetime-local
        const fechaISO = new Date(citaActual.fechaHora).toISOString().slice(0, 16);

        setFormData({
          especialidad: citaActual.especialidad,
          fechaHora: fechaISO,
          lugar: citaActual.lugar,
          nombreDoctor: citaActual.nombreDoctor || '',
          estado: citaActual.estado,
          observaciones: citaActual.observaciones || '',
        });
      } catch (err: any) {
        console.error('Error al cargar cita:', err);
        setError(err.message || 'Error al cargar la cita');
      } finally {
        setIsLoading(false);
      }
    };

    cargarCita();
  }, [citaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updateCita(citaId, {
        especialidad: formData.especialidad,
        fechaHora: new Date(formData.fechaHora),
        lugar: formData.lugar,
        nombreDoctor: formData.nombreDoctor,
        estado: formData.estado as Cita['estado'],
        observaciones: formData.observaciones,
      });

      router.push('/dashboard/recordatorios-citas');
    } catch (err: any) {
      console.error('Error al actualizar cita:', err);
      setError(err.message || 'Error al actualizar la cita');
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
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Editar Cita Médica</h1>

      {error && (
        <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <Input
          label="Especialidad *"
          placeholder="Ej: Cardiología, Medicina General"
          value={formData.especialidad}
          onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">
            Fecha y Hora *
          </label>
          <input
            type="datetime-local"
            value={formData.fechaHora}
            onChange={(e) => setFormData({ ...formData, fechaHora: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <Input
          label="Lugar *"
          placeholder="Ej: Hospital Central, Consultorio Dr. Pérez"
          value={formData.lugar}
          onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
          required
        />

        <Input
          label="Nombre del Doctor"
          placeholder="Ej: Dr. Juan Pérez"
          value={formData.nombreDoctor}
          onChange={(e) => setFormData({ ...formData, nombreDoctor: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">
            Estado *
          </label>
          <select
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {estadosCita.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        <Textarea
          label="Observaciones"
          placeholder="Notas adicionales sobre la cita..."
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          minRows={3}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            className="flex-1"
          >
            Actualizar Cita
          </Button>
          <Button
            type="button"
            color="default"
            variant="flat"
            onPress={() => router.push('/dashboard/recordatorios-citas')}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditarCitaPage;