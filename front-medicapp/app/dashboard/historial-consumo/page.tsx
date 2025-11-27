'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Alert, Button, Spinner } from '@heroui/react';
// 1. Importar la interfaz correcta y la función fetch
import { fetchHistorialConsumo, RegistroConsumo } from '@/services/historialService'; // Ajusta la ruta

function HistorialConsumoPage() {
  // 2. Usar la interfaz correcta en el estado
  const [historial, setHistorial] = useState<RegistroConsumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarHistorial = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchHistorialConsumo();
        setHistorial(data);
      } catch (err: any) {
        console.error("Error al cargar historial:", err);
        setError(err.message || 'Ocurrió un error al cargar el historial.');
      } finally {
        setIsLoading(false);
      }
    };
    cargarHistorial();
  }, []);

  // Formateador de fecha (sin cambios)
  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(dateString));
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">
          Historial de Consumo
        </h1>
        <Link href="/dashboard/historial-consumo/nuevo">
          <Button color="primary">
            Agregar Registro
          </Button>
        </Link>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Spinner color="primary" size="lg" />
          <p className="ml-4 dark:text-gray-300">Cargando historial...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div role="alert" className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* History List */}
      {!isLoading && !error && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {historial.length === 0 ? (
            <p className="p-6 text-center text-gray-500 dark:text-gray-400">
              No hay registros en tu historial de consumo.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {historial.map((item) => (
                <li key={item._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    {/* Medication Info */}
                    <div className="flex-grow mr-4">
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        {item.medicamento?.nombre || 'Medicamento desconocido'}
                        {(item.medicamento?.concentracion || item.medicamento?.presentacion) && ( // Solo muestra si hay datos
                           <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                            ({item.medicamento?.concentracion}{item.medicamento?.concentracion && item.medicamento?.presentacion ? ' - ' : ''}{item.medicamento?.presentacion})
                          </span>
                        )}
                      </p>
                      {/* 3. Muestra la descripción si existe */}
                      {item.descripcion && (
                         <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {item.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {/* 4. Usa el campo correcto: fechaHoraToma */}
                        {formatDate(item.fechaHoraToma)}
                      </p>
                      {/* 5. ELIMINADO: El span del indicador de recordatorio ya no está */}
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

export default HistorialConsumoPage;