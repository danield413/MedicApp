// back-medicapp/routes/dosis.routes.js
const { Router } = require('express');
const { getDosis, createDosis } = require('../controllers/dosis.controller');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

// GET /api/dosis - Obtener todas las dosis del usuario
router.get('/', validateJWT, getDosis);

// POST /api/dosis - Crear una nueva dosis para el usuario
router.post('/', validateJWT, createDosis);

module.exports = router;