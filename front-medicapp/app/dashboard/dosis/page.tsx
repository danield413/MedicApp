'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Alert, Button, Spinner } from '@heroui/react';
import { fetchDosis, Dosis } from '../../../services/dosisService';
import { useAuth } from '../../../hooks/auth/useAuth';


function DosisPage() {
  const [dosis, setDosis] = useState<Dosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  console.log('EditarDosisPage userId:', userId);


  useEffect(() => {
    const cargarDosis = async () => {
      // Validar que userId esté disponible
      if (!userId) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchDosis(userId);
        setDosis(data);
      } catch (err: any) {
        console.error("Error al cargar dosis:", err);
        setError(err.message || 'Ocurrió un error al cargar las dosis.');
      } finally {
        setIsLoading(false);
      }
    };
    cargarDosis();
  }, [userId]); // Agregar userId como dependencia

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">
          Mis Dosis
        </h1>
        <Link href="/dashboard/dosis/nuevo">
          <Button color="primary">
            Agregar Dosis
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Spinner color="primary" size="lg" />
          <p className="ml-4 dark:text-gray-300">Cargando dosis...</p>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {dosis.length === 0 ? (
            <p className="p-6 text-center text-gray-500 dark:text-gray-400">
              No tienes ninguna dosis registrada.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {dosis.map((item) => (
                <li key={item._id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow mr-4">
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        {item.medicamento?.nombre || 'Medicamento desconocido'}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                          Concentración: ({item.medicamento?.concentracion} - Presentación: {item.medicamento?.presentacion})
                        </span>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {item.descripcion}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Cantidad diaria: {item.cantidadDiaria} x {item.unidadMedida || 'toma(s)'}
                      </p>
                      {item.frecuencia && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Frecuencia: {item.frecuencia}
                        </p>
                      )}
                      <div className="mt-2">
                        <Link href={`/dashboard/dosis/editar/${item._id}`}>
                          <Button size="sm" color="secondary" variant="flat">
                            Editar
                          </Button>
                        </Link>
                      </div>
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

export default DosisPage;