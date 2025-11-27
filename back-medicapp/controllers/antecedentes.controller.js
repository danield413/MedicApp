const { Antecedente, Usuario } = require('../models/Schema');

// Obtener todos los antecedentes de un usuario
const getAntecedentesByUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    
    const antecedentes = await Antecedente.find({ usuario: usuarioId });

    console.log("antecednetes", antecedentes)
    
    res.status(200).json({
      success: true,
      data: antecedentes
    });
  } catch (error) {
    console.error('Error al obtener antecedentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los antecedentes',
      error: error.message
    });
  }
};

// Crear un nuevo antecedente
const createAntecedente = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { descripcion, tipo, fechaDiagnostico, activo } = req.body;

    // Validar que el usuario existe
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validar tipo de antecedente
    const tiposValidos = ['personal', 'familiar', 'quirurgico', 'alergico', 'toxico'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de antecedente no válido'
      });
    }

    // Crear el antecedente
    const nuevoAntecedente = new Antecedente({
      usuario: usuarioId,
      descripcion,
      tipo,
      fechaDiagnostico: fechaDiagnostico || null,
      activo: activo !== undefined ? activo : true
    });

    await nuevoAntecedente.save();

    // Actualizar el usuario con el nuevo antecedente
    await Usuario.findByIdAndUpdate(usuarioId, {
      $push: { antecedentes: nuevoAntecedente._id }
    });

    res.status(201).json({
      success: true,
      message: 'Antecedente creado exitosamente',
      data: nuevoAntecedente
    });
  } catch (error) {
    console.error('Error al crear antecedente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el antecedente',
      error: error.message
    });
  }
};

// Actualizar un antecedente
const updateAntecedente = async (req, res) => {
  try {
    const { antecedenteId } = req.params;
    const { descripcion, tipo, fechaDiagnostico, activo } = req.body;

    // Validar tipo de antecedente si se proporciona
    if (tipo) {
      const tiposValidos = ['personal', 'familiar', 'quirurgico', 'alergico', 'toxico'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de antecedente no válido'
        });
      }
    }

    const antecedenteActualizado = await Antecedente.findByIdAndUpdate(
      antecedenteId,
      { descripcion, tipo, fechaDiagnostico, activo },
      { new: true, runValidators: true }
    );

    if (!antecedenteActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Antecedente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Antecedente actualizado exitosamente',
      data: antecedenteActualizado
    });
  } catch (error) {
    console.error('Error al actualizar antecedente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el antecedente',
      error: error.message
    });
  }
};

// Eliminar un antecedente
const deleteAntecedente = async (req, res) => {
  try {
    const { antecedenteId } = req.params;

    const antecedente = await Antecedente.findById(antecedenteId);
    if (!antecedente) {
      return res.status(404).json({
        success: false,
        message: 'Antecedente no encontrado'
      });
    }

    // Eliminar el antecedente del array del usuario
    await Usuario.findByIdAndUpdate(antecedente.usuario, {
      $pull: { antecedentes: antecedenteId }
    });

    // Eliminar el antecedente
    await Antecedente.findByIdAndDelete(antecedenteId);

    res.status(200).json({
      success: true,
      message: 'Antecedente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar antecedente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el antecedente',
      error: error.message
    });
  }
};

module.exports = {
  getAntecedentesByUsuario,
  createAntecedente,
  updateAntecedente,
  deleteAntecedente
};