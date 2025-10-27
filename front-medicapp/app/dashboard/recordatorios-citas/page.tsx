'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Spinner, Badge } from '@heroui/react'; // Badge para el estado
import { fetchCitas, Cita } from '../../../services/citaService'; // Verifica la ruta

// Helper para mapear estados a colores de Badge (ajusta según HeroUI)
const getStatusColor = (status: Cita['estado']) => {
  switch (status) {
    case 'pendiente': return 'warning';
    case 'confirmada': return 'success';
    case 'cancelada': return 'danger';
    case 'completada': return 'neutral'; // O 'info'
    default: return 'neutral';
  }
};

function CitasPage() {
  const [citasList, setCitasList] = useState<Cita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarCitas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCitas();
        setCitasList(data);
      } catch (err: any) {
        console.error("Error al cargar citas:", err);
        setError(err.message || 'Ocurrió un error al cargar las citas.');
      } finally {
        setIsLoading(false);
      }
    };
    cargarCitas();
  }, []);

  // Formateador de fecha
  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(dateString));
    } catch { return 'Fecha inválida'; }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">
          Mis Citas Médicas
        </h1>
        <Link href="/dashboard/recordatorios-citas/nuevo">
          <Button color="primary">
            Agendar Nueva Cita
          </Button>
        </Link>
      </div>

      {isLoading && (
         <div className="flex justify-center items-center py-10">
          <Spinner color="primary" size="lg" />
          <p className="ml-4 dark:text-gray-300">Cargando citas...</p>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          <p className="font-bold">Error al cargar</p>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {citasList.length === 0 ? (
            <p className="p-6 text-center text-gray-500 dark:text-gray-400">
              No tienes ninguna cita agendada.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {citasList.map((cita) => (
                <li key={cita._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start space-y-2 sm:space-y-0 sm:space-x-4">
                    {/* Info Principal */}
                    <div className="flex-grow">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{cita.especialidad}</p>
                      <p className="font-semibold text-lg text-gray-800 dark:text-white">
                        {formatDate(cita.fechaHora)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{cita.lugar}</p>
                      {cita.nombreDoctor && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Dr(a). {cita.nombreDoctor}
                        </p>
                      )}
                    </div>
                    {/* Estado y Observaciones */}
                    <div className="text-left sm:text-right flex-shrink-0">
                      <Badge color={getStatusColor(cita.estado)} variant="solid"> {/* Ajusta variant si es necesario */}
                        {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                      </Badge>
                      {cita.observaciones && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xs truncate" title={cita.observaciones}>
                          Obs: {cita.observaciones}
                        </p>
                      )}
                       {/* Podrías añadir botones Editar/Cancelar aquí */}
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

export default CitasPage;