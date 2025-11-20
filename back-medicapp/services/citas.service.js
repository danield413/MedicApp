// back-medicapp/services/citas.service.js
const { Cita, Usuario } = require('../models/Schema'); // Importa Cita y Usuario

/**
 * Obtiene todas las citas de un usuario específico.
 * @param {string} userId - El ID del usuario autenticado.
 * @returns {Promise<Array>} - Promesa que resuelve a un array de citas.
 */
const getCitasByUser = async (userId) => {
  try {
    // Busca las citas donde el campo 'usuario' coincide con el userId
    const citas = await Cita.find({ usuario: userId })
      .sort({ fechaHora: 1 }) // Ordena por fecha ascendente (próximas primero)
      .lean(); // Devuelve objetos JS simples

    return citas;
  } catch (error) {
    console.error('Error en getCitasByUser service:', error);
    throw new Error('Error al obtener las citas del usuario');
  }
};

/**
 * Crea una nueva cita para el usuario autenticado.
 * @param {string} userId - El ID del usuario autenticado.
 * @param {object} data - Datos de la nueva cita (especialidad, fechaHora, lugar, etc.).
 * @returns {Promise<object>} - Promesa que resuelve a la nueva cita creada.
 */
const createCita = async (userId, data) => {
  try {
    // Crea la nueva cita, asociándola directamente al usuario
    const nuevaCita = new Cita({
      ...data, // especialidad, fechaHora, lugar, nombreDoctor (opc), observaciones (opc)
      usuario: userId, // Asigna el ID del usuario
      // El estado por defecto es 'pendiente' según el schema
    });

    // Guarda la cita en la base de datos
    await nuevaCita.save();

    // Opcional: Añadir la referencia de la cita al array del usuario
    await Usuario.findByIdAndUpdate(userId, {
        $push: { citas: nuevaCita._id }
    });

    // Devuelve el documento creado
    return nuevaCita.toObject(); // .toObject() o .lean()

  } catch (error) {
    console.error('Error en createCita service:', error);
    // Verifica si es un error de validación de Mongoose
    if (error.name === 'ValidationError') {
        throw new Error(`Error de validación: ${Object.values(error.errors).map(e => e.message).join(', ')}`);
    }
    throw new Error(error.message || 'Error al crear la cita');
  }
};

module.exports = {
  getCitasByUser,
  createCita,
};