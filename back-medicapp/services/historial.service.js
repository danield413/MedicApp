// back-medicapp/services/historial.service.js
const { RegistroConsumo, Medicamento, Usuario } = require('../models/Schema'); // Asegúrate de importar RegistroConsumo

/**
 * Obtiene el historial de consumo real (logs) para un usuario específico.
 * @param {string} userId - El ID del usuario autenticado.
 * @returns {Promise<Array>} - Promesa que resuelve a un array de registros de consumo.
 */
const getHistorialConsumoRealByUser = async (userId) => {
  try {
    // Buscamos los documentos en la colección RegistroConsumo
    const historial = await RegistroConsumo.find({ usuario: userId })
      .populate('medicamento', 'nombre concentracion presentacion') // Trae info del medicamento
      .sort({ fechaHoraToma: -1 }) // Ordena por fecha de toma descendente
      .lean(); // Devuelve objetos JS simples

    return historial;
  } catch (error) {
    console.error('Error en getHistorialConsumoRealByUser service:', error);
    throw new Error('Error al obtener el historial de consumo real');
  }
};

/**
 * Crea un nuevo registro en el historial de consumo real.
 * @param {string} userId - El ID del usuario autenticado.
 * @param {object} data - Datos del registro (medicamento, fechaHoraToma, descripcion).
 * @returns {Promise<object>} - Promesa que resuelve al nuevo documento creado.
 */
const addRegistroConsumo = async (userId, data) => {
  try {
    // Validar que el medicamento exista
    const medicamentoExiste = await Medicamento.findById(data.medicamento);
    if (!medicamentoExiste) {
      throw new Error('El medicamento seleccionado no existe');
    }

    // Crear el nuevo registro de consumo
    const nuevoRegistro = new RegistroConsumo({
      ...data, // Incluye medicamento, fechaHoraToma, descripcion
      usuario: userId, // Asigna el ID del usuario autenticado
    });

    // Guardar en la base de datos
    await nuevoRegistro.save();

    // Opcional: Añadir la referencia al array del usuario
    await Usuario.findByIdAndUpdate(userId, {
        $push: { historialConsumo: nuevoRegistro._id }
    });

    // Devolvemos el documento creado
    // Usamos populate para devolver también la info del medicamento en la respuesta
    const registroCreado = await RegistroConsumo.findById(nuevoRegistro._id)
                                    .populate('medicamento', 'nombre concentracion presentacion')
                                    .lean();

    return registroCreado;

  } catch (error) {
    console.error('Error en addRegistroConsumo service:', error);
    throw new Error(error.message || 'Error al crear el registro de consumo');
  }
};

module.exports = {
  getHistorialConsumoRealByUser, // <-- Renombrada para claridad
  addRegistroConsumo,
};