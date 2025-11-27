const express = require('express');
const router = express.Router();
const {
  getAntecedentesByUsuario,
  createAntecedente,
  updateAntecedente,
  deleteAntecedente
} = require('../controllers/antecedentes.controller');
// const { verificarToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
// router.use(verificarToken);

// GET /api/antecedentes/:usuarioId - Obtener antecedentes de un usuario
router.get('/:usuarioId', getAntecedentesByUsuario);

// POST /api/antecedentes/:usuarioId - Crear antecedente
router.post('/:usuarioId', createAntecedente);

// PUT /api/antecedentes/:antecedenteId - Actualizar antecedente
router.put('/:antecedenteId', updateAntecedente);

// DELETE /api/antecedentes/:antecedenteId - Eliminar antecedente
router.delete('/:antecedenteId', deleteAntecedente);

module.exports = router;