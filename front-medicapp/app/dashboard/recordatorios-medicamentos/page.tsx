'use client';

import { useState } from 'react';

export default function RecordatoriosMedicamentosPage() {
  const [notificacionesActivadas, setNotificacionesActivadas] = useState(false);

  const handleActivarNotificaciones = () => {
    setNotificacionesActivadas(true);
    alert('Tus recordatorios están activados, te enviaremos mensajes SMS');
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

          <button
            onClick={handleActivarNotificaciones}
            disabled={notificacionesActivadas}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              notificacionesActivadas
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {notificacionesActivadas ? '✓ Notificaciones Activadas' : 'Activar Notificaciones'}
          </button>

          {notificacionesActivadas && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✓ Las notificaciones SMS están activas. Recibirás recordatorios cuando sea necesario.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}