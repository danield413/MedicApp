const { Router } = require('express');
const { getMedicamentos } = require('../controllers/medicamento.controller');
const { validateJWT } = require('../middlewares/validateJWT'); // Importamos el middleware

const router = Router();

// Definimos la ruta GET para obtener todos los medicamentos
// GET /api/medicamentos
// 1. Primero se ejecuta validateJWT para verificar la autenticación (cookie)
// 2. Si el token es válido, se ejecuta el controlador getMedicamentos
router.get('/', validateJWT, getMedicamentos);

// Aquí podrías añadir más rutas en el futuro (POST, PUT, DELETE, GET por ID)
// router.post('/', validateJWT, crearMedicamento);
// router.get('/:id', validateJWT, getMedicamentoPorId);
// ...etc

module.exports = router;