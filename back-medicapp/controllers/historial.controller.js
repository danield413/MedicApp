// back-medicapp/controllers/historial.controller.js
const { response } = require('express');
const historialService = require('../services/historial.service'); // Asegúrate que la ruta sea correcta

// Helper de manejo de errores
const handleServiceError = (res, error, defaultStatus = 500) => {
  console.error('Error:', error.message);
  // Devuelve 400 si el error es por validación de negocio (ej: medicamento no existe)
  const status = error.message.includes('medicamento') ? 400 : defaultStatus;
  return res.status(status).json({
    error: error.message || 'Error interno del servidor',
  });
};

/**
 * Controlador para obtener el historial de consumo real del usuario autenticado.
 */
const getHistorialUsuario = async (req, res = response) => {
  try {
    const userId = req.usuario.id; // ID del usuario viene del middleware validateJWT
    // Llama a la función correcta del servicio
    const historial = await historialService.getHistorialConsumoRealByUser(userId);
    return res.status(200).json(historial);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

/**
 * Controlador para crear un nuevo registro en el historial de consumo real.
 */
const createRegistroConsumo = async (req, res = response) => {
  try {
    const userId = req.usuario.id; // ID del usuario autenticado
    const data = req.body; // Datos del formulario

    // Validación básica (el schema ahora usa fechaHoraToma)
    if (!data.medicamento || !data.fechaHoraToma) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: medicamento, fechaHoraToma' });
    }

    // Llama a la función correcta del servicio
    const nuevoRegistro = await historialService.addRegistroConsumo(userId, data);
    
    // Devolvemos el registro creado con estado 201 (Created)
    return res.status(201).json(nuevoRegistro);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

module.exports = {
  getHistorialUsuario,      // Exporta la función GET actualizada
  createRegistroConsumo,    // Exporta la función POST actualizada
};