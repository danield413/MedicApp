'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Calendar, User, FileText } from 'lucide-react';
import { useAuthStore } from '@/store';
import { fetchMedicamentos, MedicamentoSimple } from '@/services/historialService'; // Reutilizamos el servicio
import toast from 'react-hot-toast';

interface Medicamento {
  _id: string;
  nombre: string;
  descripcion?: string;
  concentracion: string;
  presentacion: string;
}

interface Dosis {
  _id: string;
  medicamento: Medicamento;
  cantidadDiaria: number;
  descripcion: string;
  unidadMedida?: string;
  frecuencia?: string;
}

interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  cedula: string;
}

interface Formula {
  _id: string;
  usuario: Usuario;
  fechaFormula: string;
  nombreDoctor: string;
  especialidad: string;
  institucion: string;
  dosis: Dosis[];
  diagnostico?: string;
  vigenciaHasta?: string;
}

interface FormularioData {
  usuario: string;
  nombreDoctor: string;
  especialidad: string;
  institucion: string;
  diagnostico?: string;
  vigenciaHasta?: string;
  dosisData: {
    medicamento: string;
    cantidadDiaria: number;
    descripcion: string;
    unidadMedida?: string;
    frecuencia?: string;
  }[];
}

export default function FormulasPage() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  //obtener el id del usuario actual del store
  const { userId } = useAuthStore.getState();

  const [formData, setFormData] = useState<FormularioData>({
    usuario: '',
    nombreDoctor: '',
    especialidad: '',
    institucion: '',
    diagnostico: '',
    vigenciaHasta: '',
    dosisData: [{
      medicamento: '',
      cantidadDiaria: 1,
      descripcion: '',
      unidadMedida: 'tabletas',
      frecuencia: ''
    }]
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchFormulas();
  }, []);

  useEffect(() => {
      const cargarMedicamentos = async () => {
        try {
          const meds = await fetchMedicamentos();
          setMedicamentos(meds);
        } catch (error: any) {
          toast.error('Error al cargar medicamentos: ' + error.message);
        }
      };
      cargarMedicamentos();
    }, []);

  const fetchFormulas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/formula/usuario/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFormulas(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar fórmulas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (formula?: Formula) => {
    if (formula) {
      setEditingFormula(formula);
      setFormData({
        usuario: formula.usuario._id,
        nombreDoctor: formula.nombreDoctor,
        especialidad: formula.especialidad,
        institucion: formula.institucion,
        diagnostico: formula.diagnostico || '',
        vigenciaHasta: formula.vigenciaHasta ? new Date(formula.vigenciaHasta).toISOString().split('T')[0] : '',
        dosisData: formula.dosis.map(d => ({
          medicamento: d.medicamento._id,
          cantidadDiaria: d.cantidadDiaria,
          descripcion: d.descripcion,
          unidadMedida: d.unidadMedida || 'tabletas',
          frecuencia: d.frecuencia || ''
        }))
      });
    } else {
      setEditingFormula(null);
      setFormData({
        usuario: '',
        nombreDoctor: '',
        especialidad: '',
        institucion: '',
        diagnostico: '',
        vigenciaHasta: '',
        dosisData: [{
          medicamento: '',
          cantidadDiaria: 1,
          descripcion: '',
          unidadMedida: 'tabletas',
          frecuencia: ''
        }]
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFormula(null);
  };

  const handleViewDetail = (formula: Formula) => {
    setSelectedFormula(formula);
    setShowDetailModal(true);
  };

  const handleAddDosis = () => {
    setFormData({
      ...formData,
      dosisData: [
        ...formData.dosisData,
        {
          medicamento: '',
          cantidadDiaria: 1,
          descripcion: '',
          unidadMedida: 'tabletas',
          frecuencia: ''
        }
      ]
    });
  };

  const handleRemoveDosis = (index: number) => {
    const newDosisData = formData.dosisData.filter((_, i) => i !== index);
    setFormData({ ...formData, dosisData: newDosisData });
  };

  const handleDosisChange = (index: number, field: string, value: any) => {
    const newDosisData = [...formData.dosisData];
    newDosisData[index] = { ...newDosisData[index], [field]: value };
    setFormData({ ...formData, dosisData: newDosisData });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingFormula 
        ? `${API_URL}/formula/${editingFormula._id}`
        : `${API_URL}/formula`;
      
      const method = editingFormula ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...formData,
            usuario: userId,
        }),
      });

      if (response.ok) {
        await fetchFormulas();
        handleCloseModal();
        toast.success(editingFormula ? 'Fórmula actualizada exitosamente' : 'Fórmula creada exitosamente');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error al guardar fórmula:', error);
      toast.error('Error al guardar la fórmula');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta fórmula?')) return;

    try {
      const response = await fetch(`${API_URL}/formulas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFormulas();
        toast.success('Fórmula eliminada exitosamente');
      } else {
        toast.success('Error al eliminar la fórmula');
      }
    } catch (error) {
      console.error('Error al eliminar fórmula:', error);
      toast.error('Error al eliminar la fórmula');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Fórmulas Médicas</h1>
          <p className="text-gray-600 mt-1">Gestión de prescripciones médicas</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nueva Fórmula
        </button>
      </div>

      {/* Lista de Fórmulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formulas.map((formula) => (
          <div
            key={formula._id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {formula.nombreDoctor}
                </h3>
                <p className="text-sm text-gray-600">{formula.especialidad}</p>
                <p className="text-sm text-gray-500">{formula.institucion}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                <span>{formula.usuario.nombre} {formula.usuario.apellidos}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>{formatDate(formula.fechaFormula)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText size={16} />
                <span>{formula.dosis.length} medicamento(s)</span>
              </div>
            </div>

            {formula.diagnostico && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Diagnóstico:</span> {formula.diagnostico}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleViewDetail(formula)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 px-3 py-2 rounded-md hover:bg-green-100 transition-colors text-sm"
              >
                <Eye size={16} />
                Ver
              </button>
              <button
                onClick={() => handleOpenModal(formula)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors text-sm"
              >
                <Edit2 size={16} />
                Editar
              </button>
              <button
                onClick={() => handleDelete(formula._id)}
                className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 transition-colors text-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {formulas.length === 0 && (
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No hay fórmulas médicas registradas
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza creando una nueva fórmula médica
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Crear Primera Fórmula
          </button>
        </div>
      )}

      {/* Modal de Creación/Edición */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingFormula ? 'Editar Fórmula Médica' : 'Nueva Fórmula Médica'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Información del Médico */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Información del Médico</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Doctor *
                    </label>
                    <input
                      type="text"
                      value={formData.nombreDoctor}
                      onChange={(e) => setFormData({ ...formData, nombreDoctor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especialidad *
                    </label>
                    <input
                      type="text"
                      value={formData.especialidad}
                      onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institución *
                    </label>
                    <input
                      type="text"
                      value={formData.institucion}
                      onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Diagnóstico y Vigencia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnóstico
                  </label>
                  <textarea
                    value={formData.diagnostico}
                    onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vigencia Hasta
                  </label>
                  <input
                    type="date"
                    value={formData.vigenciaHasta}
                    onChange={(e) => setFormData({ ...formData, vigenciaHasta: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Medicamentos */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Medicamentos</h3>
                  <button
                    type="button"
                    onClick={handleAddDosis}
                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <Plus size={16} />
                    Agregar Medicamento
                  </button>
                </div>

                {formData.dosisData.map((dosis, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-700">Medicamento {index + 1}</h4>
                      {formData.dosisData.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDosis(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medicamento *
                        </label>
                        <select
                          value={dosis.medicamento}
                          onChange={(e) => handleDosisChange(index, 'medicamento', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Seleccione un medicamento</option>
                          {medicamentos.map((med) => (
                            <option key={med._id} value={med._id}>
                              {med.nombre} - {med.concentracion} ({med.presentacion})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cantidad Diaria *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={dosis.cantidadDiaria}
                          onChange={(e) => handleDosisChange(index, 'cantidadDiaria', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unidad de Medida
                        </label>
                        <input
                          type="text"
                          value={dosis.unidadMedida}
                          onChange={(e) => handleDosisChange(index, 'unidadMedida', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="tabletas, ml, gotas, etc."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frecuencia
                        </label>
                        <input
                          type="text"
                          value={dosis.frecuencia}
                          onChange={(e) => handleDosisChange(index, 'frecuencia', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Cada 8 horas, cada 12 horas, etc."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción/Instrucciones *
                        </label>
                        <textarea
                          value={dosis.descripcion}
                          onChange={(e) => handleDosisChange(index, 'descripcion', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          required
                          placeholder="Instrucciones de administración"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingFormula ? 'Actualizar' : 'Crear'} Fórmula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {showDetailModal && selectedFormula && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <h2 className="text-2xl font-bold text-gray-800">Detalle de Fórmula Médica</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del Paciente */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Paciente</h3>
                <p className="text-gray-700">
                  <span className="font-semibold">Nombre:</span> {selectedFormula.usuario.nombre} {selectedFormula.usuario.apellidos}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Cédula:</span> {selectedFormula.usuario.cedula}
                </p>
              </div>

              {/* Información del Médico */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Médico</h3>
                <p className="text-gray-700">
                  <span className="font-semibold">Nombre:</span> {selectedFormula.nombreDoctor}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Especialidad:</span> {selectedFormula.especialidad}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Institución:</span> {selectedFormula.institucion}
                </p>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Fecha de Emisión</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatDate(selectedFormula.fechaFormula)}
                  </p>
                </div>
                {selectedFormula.vigenciaHasta && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Vigencia Hasta</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatDate(selectedFormula.vigenciaHasta)}
                    </p>
                  </div>
                )}
              </div>

              {/* Diagnóstico */}
              {selectedFormula.diagnostico && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Diagnóstico</h3>
                  <p className="text-gray-700">{selectedFormula.diagnostico}</p>
                </div>
              )}

              {/* Medicamentos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Medicamentos Prescritos</h3>
                <div className="space-y-4">
                  {selectedFormula.dosis.map((dosis, index) => (
                    <div key={dosis._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {index + 1}. {dosis.medicamento.nombre}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {dosis.medicamento.concentracion} - {dosis.medicamento.presentacion}
                          </p>
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {dosis.cantidadDiaria} {dosis.unidadMedida || 'dosis'}/día
                        </div>
                      </div>
                      
                      {dosis.frecuencia && (
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-semibold">Frecuencia:</span> {dosis.frecuencia}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Instrucciones:</span> {dosis.descripcion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenModal(selectedFormula);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar Fórmula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}