// back-medicapp/controllers/citas.controller.js
const { response } = require('express');
const citasService = require('../services/citas.service'); // Verifica la ruta

// Helper de manejo de errores (puedes importarlo o definirlo aquí)
const handleServiceError = (res, error, defaultStatus = 500) => {
  console.error('Error:', error.message);
  // Devuelve 400 si es un error de validación conocido
  const status = error.message.toLowerCase().includes('validación') || error.message.toLowerCase().includes('obligatorio') ? 400 : defaultStatus;
  return res.status(status).json({
    error: error.message || 'Error interno del servidor',
  });
};

/**
 * Controlador para obtener las citas del usuario autenticado.
 */
const getCitas = async (req, res = response) => {
  try {
    const userId = req.usuario.id; // ID del middleware validateJWT
    const citas = await citasService.getCitasByUser(userId);
    return res.status(200).json(citas);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

/**
 * Controlador para crear una nueva cita para el usuario autenticado.
 */
const createCita = async (req, res = response) => {
  try {
    const userId = req.usuario.id; // ID del middleware validateJWT
    const data = req.body;

    // Validación básica basada en el schema de Cita
    if (!data.especialidad || !data.fechaHora || !data.lugar) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: especialidad, fechaHora, lugar' });
    }
    // Podrías añadir validación de formato de fecha aquí si es necesario

    const nuevaCita = await citasService.createCita(userId, data);
    return res.status(201).json(nuevaCita); // 201 Created
  } catch (error) {
    return handleServiceError(res, error);
  }
};

module.exports = {
  getCitas,
  createCita,
};