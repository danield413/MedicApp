const { Medicamento } = require('../models/Schema');

/**
 * Obtiene todos los medicamentos de la base de datos.
 * @returns {Promise<Array>} - Promesa que resuelve a un array de medicamentos.
 */
const getAllMedicamentos = async () => {
  try {
    // Buscamos todos los documentos en la colección Medicamento
    // .lean() devuelve objetos JavaScript simples en lugar de documentos Mongoose
    // Es más rápido para operaciones de solo lectura.
    const medicamentos = await Medicamento.find().lean();
    return medicamentos;
  } catch (error) {
    console.error('Error en getAllMedicamentos service:', error);
    // Relanzamos el error para que el controlador lo maneje
    throw new Error('Error al obtener los medicamentos de la base de datos');
  }
};

module.exports = {
  getAllMedicamentos,
};