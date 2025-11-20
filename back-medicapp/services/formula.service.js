const { Formula, Usuario, Dosis, Medicamento } = require('../models/Schema');

const formulaService = {
  // Crear una nueva fórmula médica
  createFormula: async (formulaData) => {
    try {
      // Verificar que el usuario existe
      const usuario = await Usuario.findById(formulaData.usuario);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Crear las dosis si vienen en el objeto
      let dosisIds = [];
      if (formulaData.dosisData && formulaData.dosisData.length > 0) {
        const dosisCreadas = await Dosis.insertMany(formulaData.dosisData);
        dosisIds = dosisCreadas.map(d => d._id);
      } else if (formulaData.dosis) {
        dosisIds = formulaData.dosis;
      }

      // Crear la fórmula
      const nuevaFormula = new Formula({
        usuario: formulaData.usuario,
        fechaFormula: formulaData.fechaFormula || new Date(),
        nombreDoctor: formulaData.nombreDoctor,
        especialidad: formulaData.especialidad,
        institucion: formulaData.institucion,
        dosis: dosisIds,
        diagnostico: formulaData.diagnostico,
        vigenciaHasta: formulaData.vigenciaHasta
      });

      const formulaGuardada = await nuevaFormula.save();

      // Agregar la fórmula al usuario
      usuario.formulas.push(formulaGuardada._id);
      await usuario.save();

      // Populate para retornar la información completa
      const formulaCompleta = await Formula.findById(formulaGuardada._id)
        .populate('usuario', 'nombre apellidos cedula')
        .populate({
          path: 'dosis',
          populate: {
            path: 'medicamento',
            select: 'nombre descripcion concentracion presentacion'
          }
        });

      return formulaCompleta;
    } catch (error) {
      throw new Error(`Error al crear la fórmula: ${error.message}`);
    }
  },

  // Listar todas las fórmulas
  getAllFormulas: async () => {
    try {
      const formulas = await Formula.find()
        .populate('usuario', 'nombre apellidos cedula')
        .populate({
          path: 'dosis',
          populate: {
            path: 'medicamento',
            select: 'nombre descripcion concentracion presentacion'
          }
        })
        .sort({ fechaFormula: -1 });
      return formulas;
    } catch (error) {
      throw new Error(`Error al obtener las fórmulas: ${error.message}`);
    }
  },

  // Obtener fórmula por ID
  getFormulaById: async (formulaId) => {
    try {
      const formula = await Formula.findById(formulaId)
        .populate('usuario', 'nombre apellidos cedula celular tipoSangre')
        .populate({
          path: 'dosis',
          populate: {
            path: 'medicamento',
            select: 'nombre descripcion concentracion presentacion laboratorio'
          }
        });
      return formula;
    } catch (error) {
      throw new Error(`Error al obtener la fórmula: ${error.message}`);
    }
  },

  // Obtener fórmulas por usuario
  getFormulasByUsuario: async (usuarioId) => {
    try {
      const formulas = await Formula.find({ usuario: usuarioId })
        .populate({
          path: 'dosis',
          populate: {
            path: 'medicamento',
            select: 'nombre descripcion concentracion presentacion'
          }
        })
        .sort({ fechaFormula: -1 });
      return formulas;
    } catch (error) {
      throw new Error(`Error al obtener las fórmulas del usuario: ${error.message}`);
    }
  },

  // Actualizar una fórmula
  updateFormula: async (formulaId, formulaData) => {
    try {
      // Si se envían nuevas dosis, crearlas
      if (formulaData.dosisData && formulaData.dosisData.length > 0) {
        const dosisCreadas = await Dosis.insertMany(formulaData.dosisData);
        formulaData.dosis = dosisCreadas.map(d => d._id);
        delete formulaData.dosisData;
      }

      const formulaActualizada = await Formula.findByIdAndUpdate(
        formulaId,
        formulaData,
        { new: true, runValidators: true }
      )
        .populate('usuario', 'nombre apellidos cedula')
        .populate({
          path: 'dosis',
          populate: {
            path: 'medicamento',
            select: 'nombre descripcion concentracion presentacion'
          }
        });

      return formulaActualizada;
    } catch (error) {
      throw new Error(`Error al actualizar la fórmula: ${error.message}`);
    }
  },

  // Eliminar una fórmula
  deleteFormula: async (formulaId) => {
    try {
      const formula = await Formula.findById(formulaId);
      if (!formula) {
        return null;
      }

      // Eliminar la referencia en el usuario
      await Usuario.findByIdAndUpdate(formula.usuario, {
        $pull: { formulas: formulaId }
      });

      // Eliminar las dosis asociadas
      if (formula.dosis && formula.dosis.length > 0) {
        await Dosis.deleteMany({ _id: { $in: formula.dosis } });
      }

      // Eliminar la fórmula
      await Formula.findByIdAndDelete(formulaId);

      return formula;
    } catch (error) {
      throw new Error(`Error al eliminar la fórmula: ${error.message}`);
    }
  }
};

module.exports = formulaService;