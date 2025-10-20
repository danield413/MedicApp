const { Router } = require('express');

// 1. Importar los controladores que ya creamos
const { 
  register, 
  login, 
  logout,
  renew, 
  newPassword 
} = require('../controllers/auth.controller');

// 2. Importar el middleware de JWT
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

// 3. Implementar el controlador 'login'
router.post('/login', login);

// 4. Implementar el controlador 'register'
router.post('/register', register);

// 5. Implementar el controlador 'logout'
router.post('/logout', logout);

// --- Rutas Adicionales que ya construimos ---

// 6. Ruta para renovar el token (protegida)
// Esta ruta leerá la cookie, validará el JWT y enviará uno nuevo.
router.get('/renew', validateJWT, renew);

// 7. Ruta para cambiar la contraseña (protegida)
router.post('/new-password', validateJWT, newPassword);

module.exports = router;