// back-medicapp/middlewares/validateDomiciliarioJWT.js
const { response } = require('express');
const jwt = require('jsonwebtoken');
const { Domiciliario } = require('../models/Schema');

const validateDomiciliarioJWT = async (req, res = response, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      error: 'No hay token en la petición (cookie)',
    });
  }

  try {
    // Verificar que el token tenga el rol correcto
    const { uid, role } = jwt.verify(token, process.env.JWT_SECRET);
    if (role !== 'Domiciliario') {
      return res.status(403).json({
        error: 'Acceso denegado. Se requiere rol de Domiciliario.',
      });
    }

    const domiciliario = await Domiciliario.findById(uid);
    if (!domiciliario) {
      return res.status(401).json({
        error: 'Token no válido - domiciliario no existe en DB',
      });
    }

    req.domiciliario = domiciliario; // Adjuntar el domiciliario al request
    next();

  } catch (error) {
    console.error(error);
    return res.status(401).json({
      error: 'Token no válido',
    });
  }
};

module.exports = {
  validateDomiciliarioJWT,
};