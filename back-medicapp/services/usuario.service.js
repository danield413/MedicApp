// back-medicapp/services/usuario.service.js
const { Usuario, ResumenMedico } = require('../models/Schema');

/**
 * Actualiza la información básica de un usuario.
 * @param {string} usuarioId - El ID del usuario a actualizar.
 * @param {object} datos - Los datos a actualizar.
 * @returns {Promise<object>} - El usuario actualizado.
 */
const actualizarInfoBasica = async (usuarioId, datos) => {
  try {
    // Campos permitidos para actualizar (excluimos cedula, contrasena, etc.)
    const {
      nombre,
      apellidos,
      celular,
      fechaNacimiento,
      ciudadNacimiento,
      ciudadResidencia,
      direccion,
      tipoSangre
    } = datos;

    const camposActualizables = {
      nombre,
      apellidos,
      celular,
      fechaNacimiento,
      ciudadNacimiento,
      ciudadResidencia,
      direccion,
      tipoSangre
    };

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      { $set: camposActualizables },
      // new: true (devuelve el doc actualizado), runValidators: true (aplica validaciones del schema)
      { new: true, runValidators: true }
    ).select('-contrasena'); // No devolver la contraseña

    if (!usuarioActualizado) {
      throw new Error('Usuario no encontrado');
    }
    return usuarioActualizado;

  } catch (error) {
    console.error('Error en actualizarInfoBasica service:', error);
    throw new Error(error.message || 'Error al actualizar la información');
  }
};

const obtenerInfoBasica = async (usuarioId) => {
  try {
    const usuario = await Usuario.findById(usuarioId).select('-contrasena -resumenMedico');
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  } catch (error) {
    console.error('Error en obtenerInfoBasica service:', error);
    throw new Error(error.message || 'Error al obtener la información básica');
  }
};

/**
 * Actualiza o crea el resumen médico de un usuario.
 * @param {string} usuarioId - El ID del usuario.
 * @param {string} descripcion - La nueva descripción del resumen.
 * @returns {Promise<object>} - El resumen médico actualizado o creado.
 */
const actualizarResumenMedico = async (usuarioId, descripcion) => {
  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Buscamos el resumen por el ID guardado en el usuario
    let resumen = await ResumenMedico.findById(usuario.resumenMedico);

    if (!resumen) {
      // Si no existe, crearlo
      resumen = new ResumenMedico({
        usuario: usuarioId,
        descripcion: descripcion,
        fechaActualizacion: new Date()
      });
      // Y enlazarlo al usuario
      usuario.resumenMedico = resumen._id;
      await usuario.save();
    } else {
      // Si existe, actualizarlo
      resumen.descripcion = descripcion;
      resumen.fechaActualizacion = new Date();
    }

    await resumen.save();
    return resumen;

  } catch (error) {
    console.error('Error en actualizarResumenMedico service:', error);
    throw new Error(error.message || 'Error al actualizar el resumen médico');
  }
};

/**
 * Obtiene el resumen médico de un usuario.
 * @param {string} usuarioId - El ID del usuario.
 * @returns {Promise<object>} - El resumen médico.
 */
const getResumenMedico = async (usuarioId) => {
   try {
     const usuario = await Usuario.findById(usuarioId).populate('resumenMedico');
     if (!usuario) {
        throw new Error('Usuario no encontrado');
     }
     // Devolver el resumen populado, o un objeto default si no existe
     return usuario.resumenMedico || { descripcion: '', _id: null };
   } catch (error) {
     console.error('Error en getResumenMedico service:', error);
     throw new Error('Error al obtener el resumen médico');
   }
}

module.exports = {
  actualizarInfoBasica,
  actualizarResumenMedico,
  getResumenMedico,
  obtenerInfoBasica
};