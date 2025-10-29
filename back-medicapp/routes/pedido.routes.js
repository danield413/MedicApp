// back-medicapp/routes/pedido.routes.js
const { Router } = require('express');
const { getPendientes, aceptar } = require('../controllers/pedido.controller');
const { validateDomiciliarioJWT } = require('../middlewares/validateDomiciliarioJWT');

const router = Router();

// GET /api/pedidos/pendientes - (Solo Domiciliarios)
router.get('/pendientes', validateDomiciliarioJWT, getPendientes);

// PUT /api/pedidos/:id/aceptar - (Solo Domiciliarios)
router.put('/:id/aceptar', validateDomiciliarioJWT, aceptar);

module.exports = router;