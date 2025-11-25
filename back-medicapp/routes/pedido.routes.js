// back-medicapp/routes/pedido.routes.js
const { Router } = require('express');
const { getPendientes, aceptar } = require('../controllers/pedido.controller');
const { validateDomiciliarioJWT } = require('../middlewares/validateDomiciliarioJWT');
const { validateJWT } = require('../middlewares/validateJWT');
const { crear, getMisPedidos, actualizar, cancelar } = require('../controllers/pedido.controller');

const router = Router();


// domiciliarios 
// GET /api/pedidos/pendientes - (Solo Domiciliarios)
router.get('/pendientes', validateDomiciliarioJWT, getPendientes);

// PUT /api/pedidos/:id/aceptar - (Solo Domiciliarios)
router.put('/:id/aceptar', validateDomiciliarioJWT, aceptar);

// clientes

// POST /api/pedidos/ - Crear un pedido (Usuario autenticado)
router.post('/', validateJWT, crear);

// GET /api/pedidos/mis-pedidos - Listar pedidos del usuario (Usuario autenticado)
router.get('/mis-pedidos', validateJWT, getMisPedidos);

// PUT /api/pedidos/:id - Actualizar un pedido (Usuario autenticado)
router.put('/:id', validateJWT, actualizar);

// PUT /api/pedidos/:id/cancelar - Cancelar un pedido (Usuario autenticado)
router.put('/:id/cancelar', validateJWT, cancelar);

module.exports = router;