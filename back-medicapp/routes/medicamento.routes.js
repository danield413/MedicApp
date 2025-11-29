const { Router } = require('express');
const { getMedicamentos } = require('../controllers/medicamento.controller');
const { validateJWT } = require('../middlewares/validateJWT'); // Importamos el middleware

const router = Router();

router.get('/', validateJWT, getMedicamentos);

module.exports = router;