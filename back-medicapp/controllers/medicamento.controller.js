const { response } = require('express');
const medicamentoService = require('../services/medicamento.service');

// Podemos reutilizar el helper de manejo de errores del controlador de auth si lo exportas
// O crear uno similar aquí. Por simplicidad, lo replicamos brevemente:
const handleServiceError = (res, error, defaultStatus = 500) => {
  console.error('Error:', error.message);
  return res.status(defaultStatus).json({
    error: error.message || 'Error interno del servidor',
  });
};

/**
 * Controlador para obtener todos los medicamentos.
 */
const getMedicamentos = async (req, res = response) => {
  try {
    const medicamentos = await medicamentoService.getAllMedicamentos();
    // Si todo va bien, devolvemos los medicamentos con estado 200
    return res.status(200).json(medicamentos);
  } catch (error) {
    // Si el servicio lanza un error, lo manejamos aquí
    return handleServiceError(res, error);
  }
};

module.exports = {
  getMedicamentos,
};