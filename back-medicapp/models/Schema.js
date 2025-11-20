const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema de Usuario (actualizado con las nuevas referencias)
const usuarioSchema = new Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  celular: { type: String, required: true },
  fechaNacimiento: { type: Date },
  ciudadNacimiento: { type: String },
  ciudadResidencia: { type: String },
  direccion: { type: String },
  residencia: { type: String },
  tipoSangre: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  contrasena: { type: String, required: true },
  familiares: [{ type: Schema.Types.ObjectId, ref: 'Familiar' }],
  resumenMedico: { type: Schema.Types.ObjectId, ref: 'ResumenMedico' },
  citas: [{ type: Schema.Types.ObjectId, ref: 'Cita' }],
  pedidos: [{ type: Schema.Types.ObjectId, ref: 'Pedido' }],
  formulas: [{ type: Schema.Types.ObjectId, ref: 'Formula' }],
  // --- CAMBIOS ---
  recordatorios: [{ type: Schema.Types.ObjectId, ref: 'RecordatorioMedicamento' }], // <-- Nueva referencia
  historialConsumo: [{ type: Schema.Types.ObjectId, ref: 'RegistroConsumo' }],     // <-- Nueva referencia
  // ---------------
  antecedentes: [{ type: Schema.Types.ObjectId, ref: 'Antecedente' }]
}, { timestamps: true });

// Schema de Domiciliario (sin cambios)
const domiciliarioSchema = new Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  placaVehiculo: { type: String, required: true },
  contrasena: { type: String, required: true }, // <-- AÑADIR ESTE CAMPO
  pedidosAsignados: [{ type: Schema.Types.ObjectId, ref: 'Pedido' }]
}, { timestamps: true });

// Schema de Resumen Médico (sin cambios)
const resumenMedicoSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  descripcion: { type: String, required: true },
  fechaActualizacion: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

// Schema de Familiar (sin cambios)
const familiarSchema = new Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  celular: { type: String, required: true },
  correo: { type: String, required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  parentesco: { type: String }
}, { timestamps: true });

// Schema de Cita (sin cambios)
const citaSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  especialidad: { type: String, required: true },
  fechaHora: { type: Date, required: true },
  lugar: { type: String, required: true },
  nombreDoctor: { type: String },
  estado: { type: String, enum: ['pendiente', 'confirmada', 'cancelada', 'completada'], default: 'pendiente' },
  observaciones: { type: String }
}, { timestamps: true });

// Schema de Medicamento (sin cambios)
const medicamentoSchema = new Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  concentracion: { type: String },
  presentacion: { type: String },
  laboratorio: { type: String }
}, { timestamps: true });

// Schema de Dosis (sin cambios)
const dosisSchema = new Schema({
  medicamento: { type: Schema.Types.ObjectId, ref: 'Medicamento', required: true },
  cantidadDiaria: { type: Number, required: true },
  descripcion: { type: String, required: true },
  unidadMedida: { type: String },
  frecuencia: { type: String }
}, { timestamps: true });

// Schema de Fórmula Médica (sin cambios)
const formulaSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaFormula: { type: Date, required: true },
  nombreDoctor: { type: String, required: true },
  especialidad: { type: String, required: true },
  institucion: { type: String, required: true },
  dosis: [{ type: Schema.Types.ObjectId, ref: 'Dosis' }],
  diagnostico: { type: String },
  vigenciaHasta: { type: Date }
}, { timestamps: true });

// Schema de Pedido (sin cambios)
const pedidoSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaHora: { type: Date, required: true, default: Date.now },
  estadoPedido: {
    type: String,
    enum: ['pendiente', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  medicamentos: [{
    medicamento: { type: Schema.Types.ObjectId, ref: 'Medicamento', required: true },
    cantidad: { type: Number, required: true, default: 1 }
  }],
  domiciliario: { type: Schema.Types.ObjectId, ref: 'Domiciliario' },
  direccionEntrega: { type: String },
  total: { type: Number },
  observaciones: { type: String }
}, { timestamps: true });

// --- NUEVO SCHEMA: RecordatorioMedicamento ---
const recordatorioMedicamentoSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
  medicamento: { type: Schema.Types.ObjectId, ref: 'Medicamento', required: true },
  horasToma: [{ type: String, required: true }], // Ej. ["08:00", "20:00"]
  frecuencia: { type: String, enum: ['Diaria', 'Semanal', 'Mensual', 'Dias especificos'], default: 'Diaria' },
  diasEspecificos: [{ type: Number }], // Si frecuencia es 'Dias especificos' (0=Domingo, 6=Sábado)
  fechaInicio: { type: Date, default: Date.now },
  fechaFin: { type: Date },
  descripcionToma: { type: String }, // Ej. "Con comida"
  activo: { type: Boolean, default: true },
}, { timestamps: true });

// --- NUEVO SCHEMA: RegistroConsumo ---
const registroConsumoSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
  medicamento: { type: Schema.Types.ObjectId, ref: 'Medicamento', required: true },
  fechaHoraToma: { type: Date, required: true, default: Date.now },
  descripcion: { type: String }, // Nota opcional sobre esta toma
}, { timestamps: true });

// Schema de Antecedente (sin cambios)
const antecedenteSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  descripcion: { type: String, required: true },
  tipo: { type: String, enum: ['personal', 'familiar', 'quirurgico', 'alergico', 'toxico'], required: true },
  fechaDiagnostico: { type: Date },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

// Creación de modelos
const Usuario = mongoose.model('Usuario', usuarioSchema);
const Domiciliario = mongoose.model('Domiciliario', domiciliarioSchema);
const ResumenMedico = mongoose.model('ResumenMedico', resumenMedicoSchema);
const Familiar = mongoose.model('Familiar', familiarSchema);
const Cita = mongoose.model('Cita', citaSchema);
const Medicamento = mongoose.model('Medicamento', medicamentoSchema);
const Dosis = mongoose.model('Dosis', dosisSchema);
const Formula = mongoose.model('Formula', formulaSchema);
const Pedido = mongoose.model('Pedido', pedidoSchema);
const Antecedente = mongoose.model('Antecedente', antecedenteSchema);
// --- Nuevos modelos ---
const RecordatorioMedicamento = mongoose.model('RecordatorioMedicamento', recordatorioMedicamentoSchema);
const RegistroConsumo = mongoose.model('RegistroConsumo', registroConsumoSchema);

// Exportar modelos
module.exports = {
  Usuario,
  Domiciliario,
  ResumenMedico,
  Familiar,
  Cita,
  Medicamento,
  Dosis,
  Formula,
  Pedido,
  Antecedente,
  // --- Nuevas exportaciones ---
  RecordatorioMedicamento,
  RegistroConsumo,
};