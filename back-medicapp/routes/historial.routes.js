const { Router } = require('express');
const { getHistorialUsuario, createRegistroConsumo, getReporteConsumo } = require('../controllers/historial.controller');
const { validateJWT } = require('../middlewares/validateJWT'); // Middleware de autenticación

const router = Router();

// Ruta GET para obtener el historial del usuario logueado
// GET /api/historial-consumo
router.get('/', validateJWT, getHistorialUsuario);
router.post('/', validateJWT, createRegistroConsumo);

// GET /api/historial-consumo/reporte-consumo
router.get('/reporte-consumo', validateJWT, getReporteConsumo);

module.exports = router;