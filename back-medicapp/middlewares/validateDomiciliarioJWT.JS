const { response } = require('express');
const jwt = require('jsonwebtoken');
const { Domiciliario } = require('../models/Schema');

/**
 * Middleware para validar el JWT de un domiciliario
 * 
 * Este middleware realiza las siguientes validaciones:
 * 1. Verifica que exista un token en las cookies
 * 2. Verifica que el token sea válido y no haya expirado
 * 3. Verifica que el rol del token sea 'Domiciliario'
 * 4. Verifica que el domiciliario exista en la base de datos
 * 5. Adjunta el domiciliario al objeto request para uso posterior
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 * @returns {void} - Retorna una respuesta de error o continúa con next()
 */
const validateDomiciliarioJWT = async (req, res = response, next) => {
  // Extraer el token de las cookies de la petición
  const token = req.cookies.token;

  // Validación 1: Verificar si existe el token
  if (!token) {
    return res.status(401).json({
      error: 'No hay token en la petición (cookie)',
    });
  }

  try {
    // Validación 2: Verificar y decodificar el token usando la clave secreta
    const { uid, role } = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validación 3: Verificar que el rol del token sea 'Domiciliario'
    // Esto asegura que solo domiciliarios puedan acceder a estas rutas
    if (role !== 'Domiciliario') {
      return res.status(403).json({
        error: 'Acceso denegado. Se requiere rol de Domiciliario.',
      });
    }

    // Validación 4: Buscar el domiciliario en la base de datos usando el uid del token
    const domiciliario = await Domiciliario.findById(uid);
    if (!domiciliario) {
      return res.status(401).json({
        error: 'Token no válido - domiciliario no existe en DB',
      });
    }

    // Validación 5: Adjuntar el objeto domiciliario al request
    // Esto permite que las rutas posteriores accedan a los datos del domiciliario
    req.domiciliario = domiciliario;
    
    // Si todas las validaciones pasan, continuar con el siguiente middleware o controlador
    next();

  } catch (error) {
    // Manejo de errores: cualquier error en la verificación del token
    // (token expirado, firma inválida, formato incorrecto, etc.)
    console.error('Error en validateDomiciliarioJWT:', error);
    return res.status(401).json({
      error: 'Token no válido',
    });
  }
};

module.exports = {
  validateDomiciliarioJWT,
};