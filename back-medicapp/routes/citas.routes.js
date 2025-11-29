// back-medicapp/routes/citas.routes.js
const { Router } = require('express');
const { getCitas, createCita, updateCita } = require('../controllers/citas.controller');
const { validateJWT } = require('../middlewares/validateJWT'); // Middleware de autenticación

const router = Router();

router.get('/', validateJWT, getCitas);
router.post('/', validateJWT, createCita);
router.put('/:id', validateJWT, updateCita);

module.exports = router;