const express = require('express');
const router = express.Router();
const formulaController = require('../controllers/formula.controller');

// Crear una nueva fórmula médica
router.post('/', formulaController.createFormula);

// Listar todas las fórmulas médicas
router.get('/', formulaController.getAllFormulas);

// Obtener una fórmula por ID
router.get('/:id', formulaController.getFormulaById);

// Obtener fórmulas por usuario
router.get('/usuario/:usuarioId', formulaController.getFormulasByUsuario);

// Editar una fórmula médica
router.put('/:id', formulaController.updateFormula);

// Eliminar una fórmula médica
router.delete('/:id', formulaController.deleteFormula);

module.exports = router;