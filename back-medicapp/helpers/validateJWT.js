const { response } = require('express');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models/Schema');

const validateJWT = async (req, res = response, next) => {
  const token = req.header('x-token');

  if (!token) {
    return res.status(401).json({
      error: 'No hay token en la petición',
    });
  }

  try {
    const { uid } = jwt.verify(token, process.env.JWT_SECRET);

    // Leer el usuario de la DB para asegurarse que existe
    const usuario = await Usuario.findById(uid);

    if (!usuario) {
      return res.status(401).json({
        error: 'Token no válido - usuario no existe en DB',
      });
    }

    // Establecer el usuario en la request para uso posterior
    req.usuario = usuario;
    
    next();

  } catch (error) {
    console.error(error);
    return res.status(401).json({
      error: 'Token no válido',
    });
  }
};

module.exports = {
  validateJWT,
};