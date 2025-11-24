// back-medicapp/routes/citas.routes.js
const { Router } = require('express');
const { getCitas, createCita, updateCita } = require('../controllers/citas.controller');
const { validateJWT } = require('../middlewares/validateJWT'); // Middleware de autenticación

const router = Router();

// GET /api/citas - Obtener todas las citas del usuario (protegido)
router.get('/', validateJWT, getCitas);

// POST /api/citas - Crear una nueva cita para el usuario (protegido)
router.post('/', validateJWT, createCita);

// PUT /api/citas/:id - Actualizar una cita (protegido)
router.put('/:id', validateJWT, updateCita);

module.exports = router;