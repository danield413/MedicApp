const bcrypt = require('bcryptjs');
const { Usuario, Domiciliario } = require('../models/Schema');
const { generarJWT } = require('../helpers/jwt');

/**
 * Registra un nuevo usuario en la base de datos
 * @param {object} userData - Datos del usuario (nombre, apellidos, cedula, contrasena, etc.)
 */
const registerUser = async (userData) => {
  const { cedula, contrasena } = userData;

  try {
    let usuario = await Usuario.findOne({ cedula });
    if (usuario) {
      throw new Error('Un usuario ya existe con esa cédula');
    }

    usuario = new Usuario(userData);

    // Encriptar contraseña
    const salt = bcrypt.genSaltSync();
    usuario.contrasena = bcrypt.hashSync(contrasena, salt);

    await usuario.save();

    // Generar JWT
    const token = await generarJWT(usuario.id, usuario.cedula, 'Usuario');

    // Devolvemos token y usuario por separado para el controlador
    return {
      token,
      usuario: {
        uid: usuario.id,
        nombre: usuario.nombre,
        cedula: usuario.cedula,
      }
    };
  } catch (error) {
    console.error('Error en registerUser service:', error);
    throw new Error(error.message || 'Error al registrar usuario');
  }
};

/**
 * Loguea un usuario existente
 * @param {string} cedula
 * @param {string} contrasena
 */
const loginUser = async (cedula, contrasena) => {
  try {
    const usuario = await Usuario.findOne({ cedula });
    if (!usuario) {
      throw new Error('Cédula o contraseña incorrectas');
    }

    // Confirmar contraseña
    const validPassword = bcrypt.compareSync(contrasena, usuario.contrasena);
    if (!validPassword) {
      throw new Error('Cédula o contraseña incorrectas');
    }

    // Generar JWT
    const token = await generarJWT(usuario.id, usuario.cedula, 'Usuario');

    // Devolvemos token y usuario por separado para el controlador
    return {
      token,
      usuario: {
        uid: usuario.id,
        nombre: usuario.nombre,
        cedula: usuario.cedula,
      }
    };
  } catch (error) {
    console.error('Error en loginUser service:', error);
    throw new Error(error.message || 'Error al iniciar sesión');
  }
};

/**
 * Renueva el token de un usuario autenticado
 * @param {object} usuario - El objeto de usuario autenticado (desde middleware)
 */
const renewToken = async (usuario) => {
  try {
    // Generar un nuevo JWT
   const token = await generarJWT(usuario.id, usuario.cedula, 'Usuario');

    // Devolvemos token y usuario por separado para el controlador
    return {
      token,
      usuario: {
        uid: usuario.id,
        nombre: usuario.nombre,
        cedula: usuario.cedula,
      }
    };
  } catch (error) {
    console.error('Error en renewToken service:', error);
    throw new Error('Error al renovar el token');
  }
};

/**
 * Actualiza la contraseña de un usuario autenticado
 * @param {object} usuario - El objeto de usuario autenticado (desde middleware)
 * @param {string} oldPassword - Contraseña antigua
 * @param {string} newPassword - Contraseña nueva
 */
const updatePassword = async (usuario, oldPassword, newPassword) => {
  try {
    // Verificar contraseña antigua
    const validPassword = bcrypt.compareSync(oldPassword, usuario.contrasena);
    if (!validPassword) {
      throw new Error('La contraseña antigua no es correcta');
    }

    // Encriptar nueva contraseña
    const salt = bcrypt.genSaltSync();
    usuario.contrasena = bcrypt.hashSync(newPassword, salt);

    await usuario.save();

    return {
      msg: 'Contraseña actualizada correctamente',
    };
  } catch (error) {
    console.error('Error en updatePassword service:', error);
    throw new Error(error.message || 'Error al actualizar la contraseña');
  }
};

/**
 * Loguea un domiciliario existente
 * @param {string} cedula
 * @param {string} contrasena
 */
const loginDomiciliario = async (cedula, contrasena) => {
  try {
    const domiciliario = await Domiciliario.findOne({ cedula });
    if (!domiciliario) {
      throw new Error('Cédula o contraseña incorrectas');
    }

    const validPassword = bcrypt.compareSync(contrasena, domiciliario.contrasena);
    if (!validPassword) {
      throw new Error('Cédula o contraseña incorrectas');
    }

    // Generar JWT con role 'Domiciliario'
    const token = await generarJWT(domiciliario.id, domiciliario.cedula, 'Domiciliario');

    return {
      token,
      usuario: { // Devolvemos un objeto 'usuario' genérico para el frontend
        uid: domiciliario.id,
        nombre: domiciliario.nombre,
        cedula: domiciliario.cedula,
        role: 'Domiciliario' // <-- importante
      }
    };
  } catch (error) {
    console.error('Error en loginDomiciliario service:', error);
    throw new Error(error.message || 'Error al iniciar sesión');
  }
};


module.exports = {
  registerUser,
  loginUser,
  renewToken,
  updatePassword,
  loginDomiciliario,
};