// back-medicapp/controllers/dosis.controller.js
const { response } = require('express');
const dosisService = require('../services/dosis.service');

const handleServiceError = (res, error, defaultStatus = 500) => {
  console.error('Error:', error.message);
  const status = error.message.includes('medicamento') ? 400 : defaultStatus;
  return res.status(status).json({
    error: error.message || 'Error interno del servidor',
  });
};

/**
 * Controlador para obtener las dosis del usuario autenticado.
 */
const getDosis = async (req, res = response) => {
  try {
    const userId = req.params.id;
    const dosis = await dosisService.getDosisByUser(userId);
    return res.status(200).json(dosis);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

/**
 * Controlador para crear una nueva dosis para el usuario autenticado.
 */
const createDosis = async (req, res = response) => {
  try {
    const userId = req.usuario.id;
    const data = req.body;

    // Validación básica (basada en el schema de Dosis)
    if (!data.medicamento || !data.cantidadDiaria || !data.descripcion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: medicamento, cantidadDiaria, descripcion' });
    }

    const nuevaDosis = await dosisService.createDosis(userId, data);
    return res.status(201).json(nuevaDosis);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

/**
 * Controlador para actualizar una dosis existente del usuario autenticado.
 */
const updateDosis = async (req, res = response) => {

  console.log('Actualizar dosis - req.params:', req.params);

  try {
    const id = req.params.id;
    const data = req.body;

    // Validación básica
    if (!id) {
      return res.status(400).json({ error: 'ID de dosis requerido' });
    }

    const dosisActualizada = await dosisService.updateDosis(id, data);
    return res.status(200).json(dosisActualizada);
  } catch (error) {
    return handleServiceError(res, error, 404);
  }
};

module.exports = {
  getDosis,
  createDosis,
  updateDosis,
};