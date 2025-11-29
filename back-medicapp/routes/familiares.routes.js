const express = require('express');
const router = express.Router();
const {
  getFamiliaresByUsuario,
  createFamiliar,
  updateFamiliar,
  deleteFamiliar
} = require('../controllers/familiares.controller');
const { validateJWT } = require('../middlewares/validateJWT');

router.get('/:usuarioId', getFamiliaresByUsuario);
router.post('/:usuarioId', createFamiliar);
router.put('/:familiarId', updateFamiliar);
router.delete('/:familiarId', deleteFamiliar);

module.exports = router;