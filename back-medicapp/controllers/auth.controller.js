const { response } = require('express');
const authService = require('../services/auth.service');

const forgotPassword = async (req, res = response) => {
  const { celular } = req.body; // Ahora esperamos 'celular'
  
  try {
    if (!celular) {
      return res.status(400).json({ error: 'El número de celular es obligatorio' });
    }

    const result = await authService.resetPasswordByCelular(celular);
    return res.status(200).json(result);
  } catch (error) {
    // Usamos tu helper de errores existente
    return handleServiceError(res, error, 400);
  }
};

const loginDomiciliario = async (req, res = response) => {
  const { cedula, contrasena } = req.body;
  try {
    const { token, usuario } = await authService.loginDomiciliario(cedula, contrasena);
    setTokenCookie(res, token);
    return res.status(200).json(usuario);
  } catch (error) {
    return handleServiceError(res, error, 400);
  }
};

/**
 * Helper para manejar errores de servicio de forma centralizada
 * @param {response} res - Objeto de respuesta de Express
 * @param {Error} error - El error capturado
 * @param {number} defaultStatus - Estado HTTP por defecto si no es un error conocido
 */
const handleServiceError = (res, error, defaultStatus = 500) => {
  // Errores 400 (Bad Request) por lógica de negocio
  const isBadRequest = 
    error.message.includes('incorrectas') || 
    error.message.includes('cédula') || 
    error.message.includes('antigua') ||
    error.message.includes('no existe');

  const status = isBadRequest ? 400 : defaultStatus;
  
  return res.status(status).json({
    error: error.message || 'Error interno del servidor',
  });
};

/**
 * Helper para establecer la cookie de autenticación
 * @param {response} res - Objeto de respuesta de Express
 * @param {string} token - El JWT a establecer en la cookie
 */
const setTokenCookie = (res, token) => {
  const options = {
    httpOnly: true, // El frontend no puede leerla con JS
    secure: process.env.NODE_ENV === 'production', // Solo en HTTPS (en producción)
    sameSite: 'strict', // O 'lax' si tienes problemas entre dominios
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  };
  res.cookie('token', token, options);
};

const register = async (req, res = response) => {
  try {
    // 1. Recibimos token y usuario del servicio
    const { token, usuario } = await authService.registerUser(req.body);
    
    // 2. Establecemos la cookie
    setTokenCookie(res, token);
    
    // 3. Devolvemos solo los datos del usuario (el token ya va en la cookie)
    return res.status(201).json(usuario);
  } catch (error) {
    return handleServiceError(res, error, 400);
  }
};

const login = async (req, res = response) => {
  const { cedula, contrasena } = req.body;
  try {
    // 1. Recibimos token y usuario
    const { token, usuario } = await authService.loginUser(cedula, contrasena);

    // 2. Establecemos la cookie
    setTokenCookie(res, token);
    
    // 3. Devolvemos solo los datos del usuario
    return res.status(200).json(usuario);
  } catch (error) {
    return handleServiceError(res, error, 400);
  }
};

const renew = async (req, res = response) => {
  try {
    // req.usuario es establecido por el middleware validateJWT
    
    // 1. Recibimos token y usuario
    const { token, usuario } = await authService.renewToken(req.usuario);

    // 2. Establecemos la cookie (renovamos)
    setTokenCookie(res, token);
    
    // 3. Devolvemos solo los datos del usuario
    return res.status(200).json(usuario);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

/**
 * Controlador para cambiar la contraseña de un usuario
 */
const newPassword = async (req, res = response) => {
  const { oldPassword, newPassword } = req.body;
  try {
    // req.usuario es establecido por el middleware validateJWT
    const data = await authService.updatePassword(req.usuario, oldPassword, newPassword);
    return res.status(200).json(data);
  } catch (error) {
    return handleServiceError(res, error, 400);
  }
};

/**
 * Controlador de Logout
 */
const logout = (req, res = response) => {
  try {
    // Borramos la cookie estableciendo una fecha de expiración pasada
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    return res.status(200).json({ msg: 'Sesión cerrada exitosamente' });
  } catch (error) {
     return handleServiceError(res, error);
  }
};

module.exports = {
  register,
  login,
  renew,
  newPassword, // <-- Aquí está la función que faltaba
  logout,
  loginDomiciliario,
  forgotPassword
};