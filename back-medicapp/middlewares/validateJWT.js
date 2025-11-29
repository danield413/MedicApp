const { response } = require('express');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models/Schema');

/**
 * Middleware para validar el JWT de un usuario
 * 
 * Este middleware realiza las siguientes validaciones:
 * 1. Verifica que exista un token en las cookies
 * 2. Verifica que el token sea válido y no haya expirado
 * 3. Verifica que el usuario exista en la base de datos
 * 4. Adjunta el usuario al objeto request para uso posterior
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 * @returns {void} - Retorna una respuesta de error o continúa con next()
 */
const validateJWT = async (req, res = response, next) => {
  // Validación 1: Extraer el token de las cookies de la petición
  // Las cookies son más seguras que localStorage para almacenar tokens JWT
  const token = req.cookies.token;
  console.log('Token from cookie:', token);

  // Validación 2: Verificar si existe el token
  if (!token) {
    return res.status(401).json({
      error: 'No hay token en la petición (cookie)',
    });
  }

  try {
    // Validación 3: Verificar y decodificar el token usando la clave secreta
    // jwt.verify lanza un error si el token es inválido o está expirado
    const { uid } = jwt.verify(token, process.env.JWT_SECRET);

    // Validación 4: Buscar el usuario en la base de datos usando el uid del token
    const usuario = await Usuario.findById(uid);

    // Validación 5: Verificar que el usuario exista en la base de datos
    if (!usuario) {
      return res.status(401).json({
        error: 'Token no válido - usuario no existe en DB',
      });
    }

    // Validación 6: Adjuntar el objeto usuario al request
    // Esto permite que las rutas posteriores accedan a los datos del usuario autenticado
    req.usuario = usuario;    
    
    // Si todas las validaciones pasan, continuar con el siguiente middleware o controlador
    next();

  } catch (error) {
    // Manejo de errores: cualquier error en la verificación del token
    // (token expirado, firma inválida, formato incorrecto, etc.)
    console.error(error);
    return res.status(401).json({
      error: 'Token no válido',
    });
  }
};

module.exports = {
  validateJWT,
};