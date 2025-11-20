const { Router } = require('express');
const { getHistorialUsuario, createRegistroConsumo } = require('../controllers/historial.controller');
const { validateJWT } = require('../middlewares/validateJWT'); // Middleware de autenticación

const router = Router();

// Ruta GET para obtener el historial del usuario logueado
// GET /api/historial-consumo
router.get('/', validateJWT, getHistorialUsuario);
router.post('/', validateJWT, createRegistroConsumo);

module.exports = router;