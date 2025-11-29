// back-medicapp/routes/pedido.routes.js
const { Router } = require('express');
const { getPendientes, aceptar } = require('../controllers/pedido.controller');
const { validateDomiciliarioJWT } = require('../middlewares/validateDomiciliarioJWT');
const { validateJWT } = require('../middlewares/validateJWT');
const { crear, getMisPedidos, actualizar, cancelar } = require('../controllers/pedido.controller');

const router = Router();


router.get('/pendientes', validateDomiciliarioJWT, getPendientes);
router.put('/:id/aceptar', validateDomiciliarioJWT, aceptar);
router.post('/', validateJWT, crear);
router.get('/mis-pedidos', validateJWT, getMisPedidos);
router.put('/:id', validateJWT, actualizar);
router.put('/:id/cancelar', validateJWT, cancelar);

module.exports = router;