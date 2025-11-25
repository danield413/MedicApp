'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getReporteConsumo } from '@/services/historialService';
import { toast } from 'sonner';

// Registrar componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ReporteConsumoPage() {
  const [loading, setLoading] = useState(true);
  const [registros, setRegistros] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getReporteConsumo();
      setRegistros(data);
      processChartData(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data: any[]) => {
    // Agrupar conteo por nombre de medicamento
    const conteo: Record<string, number> = {};
    
    data.forEach((reg) => {
      const nombre = reg.medicamento?.nombre || 'Desconocido';
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    const labels = Object.keys(conteo);
    const values = Object.values(conteo);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Dosis Consumidas (Último Mes)',
          data: values,
          backgroundColor: 'rgba(59, 130, 246, 0.6)', // Azul tipo Tailwind blue-500
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    });
  };

  if (loading) return <div className="p-8">Cargando reporte...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reporte de Consumo Mensual</h1>

      {/* Sección del Gráfico */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Resumen de Tomas por Medicamento</h2>
        <div className="h-64 md:h-80 w-full">
          {chartData && (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' as const },
                },
                scales: {
                  y: { beginAtZero: true, ticks: { stepSize: 1 } },
                },
              }}
            />
          )}
          {registros.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No hay datos de consumo este mes.</p>
          )}
        </div>
      </div>

      {/* Sección de la Tabla */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Historial Detallado</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3">Medicamento</th>
                <th className="px-4 py-3">Detalle</th>
                <th className="px-4 py-3">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registros.map((reg) => (
                <tr key={reg._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {format(new Date(reg.fechaHoraToma), "d 'de' MMMM, h:mm a", { locale: es })}
                  </td>
                  <td className="px-4 py-3 font-medium text-blue-600">
                    {reg.medicamento?.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {reg.medicamento?.concentracion} - {reg.medicamento?.presentacion}
                  </td>
                  <td className="px-4 py-3 text-gray-500 italic">
                    {reg.descripcion || '-'}
                  </td>
                </tr>
              ))}
              {registros.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No se encontraron registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}