const formulaService = require('../services/formula.service');

const formulaController = {
  // Crear una nueva fórmula médica
  createFormula: async (req, res) => {
    try {
      const formula = await formulaService.createFormula(req.body);
      res.status(201).json({
        success: true,
        message: 'Fórmula médica creada exitosamente',
        data: formula
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear la fórmula médica',
        error: error.message
      });
    }
  },

  // Listar todas las fórmulas médicas
  getAllFormulas: async (req, res) => {
    try {
      const formulas = await formulaService.getAllFormulas();
      res.status(200).json({
        success: true,
        data: formulas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las fórmulas médicas',
        error: error.message
      });
    }
  },

  // Obtener fórmula por ID
  getFormulaById: async (req, res) => {
    try {
      const formula = await formulaService.getFormulaById(req.params.id);
      if (!formula) {
        return res.status(404).json({
          success: false,
          message: 'Fórmula no encontrada'
        });
      }
      res.status(200).json({
        success: true,
        data: formula
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la fórmula',
        error: error.message
      });
    }
  },

  // Obtener fórmulas por usuario
  getFormulasByUsuario: async (req, res) => {
    try {
      const formulas = await formulaService.getFormulasByUsuario(req.params.usuarioId);
      res.status(200).json({
        success: true,
        data: formulas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las fórmulas del usuario',
        error: error.message
      });
    }
  },

  // Editar una fórmula médica
  updateFormula: async (req, res) => {
    try {
      const formula = await formulaService.updateFormula(req.params.id, req.body);
      if (!formula) {
        return res.status(404).json({
          success: false,
          message: 'Fórmula no encontrada'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Fórmula actualizada exitosamente',
        data: formula
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al actualizar la fórmula',
        error: error.message
      });
    }
  },

  // Eliminar una fórmula médica
  deleteFormula: async (req, res) => {
    try {
      const formula = await formulaService.deleteFormula(req.params.id);
      if (!formula) {
        return res.status(404).json({
          success: false,
          message: 'Fórmula no encontrada'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Fórmula eliminada exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la fórmula',
        error: error.message
      });
    }
  }
};

module.exports = formulaController;