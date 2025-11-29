const jwt = require('jsonwebtoken');

/**
 * Genera un JSON Web Token
 * @param {string} uid - El ID del usuario o domiciliario
 * @param {string} cedula - La cédula
 * @param {string} role - 'Usuario' o 'Domiciliario'
 * @returns {Promise<string>} - Promesa que resuelve al token
 */
const generarJWT = (uid, cedula, role) => { 
  return new Promise((resolve, reject) => {
    const payload = { uid, cedula, role };

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