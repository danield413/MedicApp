'use client';

import { useState } from 'react';

export default function RecordatoriosMedicamentosPage() {
  const [notificacionesActivadas, setNotificacionesActivadas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datosUsuario, setDatosUsuario] = useState<{ nombre: string; telefono: string } | null>(null);

  const handleActivarNotificaciones = async () => {
    setLoading(true);
    setError(null);

    try {

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recordatorios/activar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al activar las notificaciones');
      }

      const data = await response.json();

      setNotificacionesActivadas(true);
      setDatosUsuario(data.usuario);
      
      alert('Tus recordatorios están activados, te enviaremos mensajes SMS');
      
      console.log('Respuesta del servidor:', data);
    } catch (err: any) {
      console.error('Error al activar notificaciones:', err);
      setError(err.message || 'Error al activar las notificaciones');
      alert('Error al activar las notificaciones. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Recordatorios de Medicamentos
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-6">
            Activa las notificaciones para recibir recordatorios sobre tus medicamentos
            directamente en tu teléfono móvil mediante mensajes SMS.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">⚠️ {error}</p>
            </div>
          )}

          <button
            onClick={handleActivarNotificaciones}
            disabled={notificacionesActivadas || loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              notificacionesActivadas
                ? 'bg-green-500 text-white cursor-not-allowed'
                : loading
                ? 'bg-gray-400 text-white cursor-wait'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Activando...
              </span>
            ) : notificacionesActivadas ? (
              '✓ Notificaciones Activadas'
            ) : (
              'Activar Notificaciones'
            )}
          </button>

          {notificacionesActivadas && datosUsuario && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold mb-2">
                ✓ Las notificaciones SMS están activas
              </p>
              <p className="text-green-700 text-sm">
                {datosUsuario.nombre}, recibirás recordatorios cuando sea necesario tomar tus medicamentos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}