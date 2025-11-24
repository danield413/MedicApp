const express = require('express');
const router = express.Router();
const {
  getFamiliaresByUsuario,
  createFamiliar,
  updateFamiliar,
  deleteFamiliar
} = require('../controllers/familiares.controller');
const { validateJWT } = require('../middlewares/validateJWT');

// Todas las rutas requieren autenticación
// router.use(validateJWT);

// GET /api/familiares/:usuarioId - Obtener familiares de un usuario
router.get('/:usuarioId', getFamiliaresByUsuario);

// POST /api/familiares/:usuarioId - Crear familiar
router.post('/:usuarioId', createFamiliar);

// PUT /api/familiares/:familiarId - Actualizar familiar
router.put('/:familiarId', updateFamiliar);

// DELETE /api/familiares/:familiarId - Eliminar familiar
router.delete('/:familiarId', deleteFamiliar);

module.exports = router;