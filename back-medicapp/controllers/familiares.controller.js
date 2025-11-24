const { Familiar, Usuario } = require('../models/Schema');

// Obtener todos los familiares de un usuario
const getFamiliaresByUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    
    const familiares = await Familiar.find({ usuario: usuarioId });
    
    res.status(200).json({
      success: true,
      data: familiares
    });
  } catch (error) {
    console.error('Error al obtener familiares:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los familiares',
      error: error.message
    });
  }
};

// Crear un nuevo familiar
const createFamiliar = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { nombre, apellido, cedula, celular, correo, parentesco } = req.body;

    // Validar que el usuario existe
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Crear el familiar
    const nuevoFamiliar = new Familiar({
      nombre,
      apellido,
      cedula,
      celular,
      correo,
      usuario: usuarioId,
      parentesco
    });

    await nuevoFamiliar.save();

    // Actualizar el usuario con el nuevo familiar
    await Usuario.findByIdAndUpdate(usuarioId, {
      $push: { familiares: nuevoFamiliar._id }
    });

    res.status(201).json({
      success: true,
      message: 'Familiar creado exitosamente',
      data: nuevoFamiliar
    });
  } catch (error) {
    console.error('Error al crear familiar:', error);
    
    // Manejar error de cédula duplicada
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un familiar con esta cédula'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear el familiar',
      error: error.message
    });
  }
};

// Actualizar un familiar
const updateFamiliar = async (req, res) => {
  try {
    const { familiarId } = req.params;
    const { nombre, apellido, cedula, celular, correo, parentesco } = req.body;

    const familiarActualizado = await Familiar.findByIdAndUpdate(
      familiarId,
      { nombre, apellido, cedula, celular, correo, parentesco },
      { new: true, runValidators: true }
    );

    if (!familiarActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Familiar no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Familiar actualizado exitosamente',
      data: familiarActualizado
    });
  } catch (error) {
    console.error('Error al actualizar familiar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el familiar',
      error: error.message
    });
  }
};

// Eliminar un familiar
const deleteFamiliar = async (req, res) => {
  try {
    const { familiarId } = req.params;

    const familiar = await Familiar.findById(familiarId);
    if (!familiar) {
      return res.status(404).json({
        success: false,
        message: 'Familiar no encontrado'
      });
    }

    // Eliminar el familiar del array del usuario
    await Usuario.findByIdAndUpdate(familiar.usuario, {
      $pull: { familiares: familiarId }
    });

    // Eliminar el familiar
    await Familiar.findByIdAndDelete(familiarId);

    res.status(200).json({
      success: true,
      message: 'Familiar eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar familiar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el familiar',
      error: error.message
    });
  }
};

module.exports = {
  getFamiliaresByUsuario,
  createFamiliar,
  updateFamiliar,
  deleteFamiliar
};