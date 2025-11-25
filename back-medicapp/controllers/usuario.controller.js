// back-medicapp/controllers/usuario.controller.js
const { response } = require('express');
const usuarioService = require('../services/usuario.service');

const handleServiceError = (res, error, defaultStatus = 500) => {
  console.error('Error:', error.message);
  let status = defaultStatus;
  if (error.message.includes('no encontrado')) {
    status = 404;
  } else if (error.message.includes('requerida')) {
    status = 400;
  }
  
  return res.status(status).json({
    error: error.message || 'Error interno del servidor',
  });
};

const getInfoBasica = async (req, res = response) => {
  try {
    const usuarioId = req.params.id; // Tomar el ID de los parámetros de la URL
    console.log('Usuario ID para obtener info básica:', usuarioId);
    
    const usuario = await usuarioService.obtenerInfoBasica(usuarioId);
    return res.json(usuario);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

const updateInfoBasica = async (req, res = response) => {
  try {
    const usuarioId = req.usuario.id; // Desde validateJWT
    const datos = req.body;
    const usuarioActualizado = await usuarioService.actualizarInfoBasica(usuarioId, datos);
    return res.status(200).json(usuarioActualizado);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

const updateResumenMedico = async (req, res = response) => {
  try {
    const usuarioId = req.usuario.id; // Desde validateJWT
    const { descripcion } = req.body;
    
    if (typeof descripcion === 'undefined') {
        throw new Error('La "descripcion" es requerida');
    }

    const resumenActualizado = await usuarioService.actualizarResumenMedico(usuarioId, descripcion);
    return res.status(200).json(resumenActualizado);
  } catch (error) {
    return handleServiceError(res, error, 400);
  }
};

const getMiResumenMedico = async (req, res = response) => {
    try {
        const usuarioId = req.usuario.id; // Desde validateJWT
        const resumen = await usuarioService.getResumenMedico(usuarioId);
        return res.status(200).json(resumen);
    } catch (error) {
        return handleServiceError(res, error);
    }
}

module.exports = {
  updateInfoBasica,
  updateResumenMedico,
  getMiResumenMedico,
  getInfoBasica
};