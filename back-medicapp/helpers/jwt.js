const jwt = require('jsonwebtoken');

/**
 * Genera un JSON Web Token
 * @param {string} uid - El ID de usuario de MongoDB
 * @param {string} cedula - La cédula del usuario
 * @returns {Promise<string>} - Promesa que resuelve al token
 */
const generarJWT = (uid, cedula) => {
  return new Promise((resolve, reject) => {
    const payload = { uid, cedula };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
      },
      (err, token) => {
        if (err) {
          console.error('Error al generar JWT:', err);
          reject('No se pudo generar el token');
        } else {
          resolve(token);
        }
      }
    );
  });
};

module.exports = {
  generarJWT,
};