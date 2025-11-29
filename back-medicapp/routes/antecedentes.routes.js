const express = require('express');
const router = express.Router();
const {
  getAntecedentesByUsuario,
  createAntecedente,
  updateAntecedente,
  deleteAntecedente
} = require('../controllers/antecedentes.controller');

router.get('/:usuarioId', getAntecedentesByUsuario);
router.post('/:usuarioId', createAntecedente);
router.put('/:antecedenteId', updateAntecedente);
router.delete('/:antecedenteId', deleteAntecedente);

module.exports = router;