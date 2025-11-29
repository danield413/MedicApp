const express = require('express');
const router = express.Router();
const formulaController = require('../controllers/formula.controller');

router.post('/', formulaController.createFormula);
router.get('/', formulaController.getAllFormulas);
router.get('/:id', formulaController.getFormulaById);
router.get('/usuario/:usuarioId', formulaController.getFormulasByUsuario);
router.put('/:id', formulaController.updateFormula);
router.delete('/:id', formulaController.deleteFormula);

module.exports = router;