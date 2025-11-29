const { Router } = require('express');
const { getHistorialUsuario, createRegistroConsumo, getReporteConsumo } = require('../controllers/historial.controller');
const { validateJWT } = require('../middlewares/validateJWT'); 

const router = Router();
router.get('/', validateJWT, getHistorialUsuario);
router.post('/', validateJWT, createRegistroConsumo);
router.get('/reporte-consumo', validateJWT, getReporteConsumo);

module.exports = router;