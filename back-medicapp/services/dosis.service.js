// back-medicapp/services/dosis.service.js
// 1. Importamos los schemas necesarios
const { Dosis, Medicamento, Usuario, Formula } = require('../models/Schema');
const { default: mongoose } = require('mongoose');

/**
 * Obtiene todas las dosis creadas por un usuario específico.
 * @param {string} userId - El ID del usuario autenticado.
 * @returns {Promise<Array>} - Promesa que resuelve a un array de dosis.
 */
const getDosisByUser = async (userId) => {
  try {
    // Buscamos las dosis donde el usuario sea el creador
    // Opcional: Si las dosis están en las Fórmulas del usuario:
    // 1. Encontrar fórmulas del usuario
    const userFormulas = await Formula.find({ usuario: userId }).select('dosis').lean();
    const dosisIds = userFormulas.flatMap(f => f.dosis);

    // 2. Buscar todas las dosis que coincidan con esos IDs
    const dosis = await Dosis.find({
      '_id': { $in: dosisIds }
    })
    .populate('medicamento', 'nombre concentracion presentacion') // Trae info del medicamento
    .sort({ createdAt: -1 }) // Opcional: ordenar
    .lean();

    return dosis;
  } catch (error) {
    console.error('Error en getDosisByUser service:', error);
    throw new Error('Error al obtener las dosis');
  }
};

/**
 * Crea una nueva dosis y la asocia a una fórmula (nueva o existente) del usuario.
 * @param {string} userId - El ID del usuario autenticado.
 * @param {object} data - Datos de la nueva dosis (medicamento, cantidadDiaria, etc.).
 * @returns {Promise<object>} - Promesa que resuelve a la nueva dosis creada.
 */
const createDosis = async (userId, data) => {
  let session;
  try {
    // Validar que el medicamento exista
    const medicamentoExiste = await Medicamento.findById(data.medicamento);
    if (!medicamentoExiste) {
      throw new Error('El medicamento seleccionado no existe');
    }
    
    // Iniciar una transacción para asegurar consistencia
    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Crear la nueva dosis
    const nuevaDosis = new Dosis({
      ...data,
      // Nota: El schema de Dosis no tiene 'usuario', se vincula a través de la 'Formula'
    });
    await nuevaDosis.save({ session });

    // 2. Buscar una fórmula "general" o "mis dosis" para este usuario.
    // Si no existe, la creamos.
    let formulaUsuario = await Formula.findOne({ 
      usuario: userId, 
      nombreDoctor: 'Autoregistrado' // Usamos un campo para identificarla
    }, null, { session });

    if (!formulaUsuario) {
      formulaUsuario = new Formula({
        usuario: userId,
        fechaFormula: new Date(),
        nombreDoctor: 'Autoregistrado', // Identificador
        especialidad: 'General',
        institucion: 'MedicApp',
        diagnostico: 'Dosis registradas por el usuario',
        dosis: []
      });
    }

    // 3. Añadir la nueva dosis a la fórmula
    formulaUsuario.dosis.push(nuevaDosis._id);
    await formulaUsuario.save({ session });

    // 4. (Opcional) Añadir la fórmula al usuario si es nueva
    // Usamos $addToSet para evitar duplicados
    await Usuario.findByIdAndUpdate(userId, 
      { $addToSet: { formulas: formulaUsuario._id } },
      { session }
    );
    
    // Si todo va bien, confirmamos la transacción
    await session.commitTransaction();

    // Devolvemos la dosis creada y poblada
    const dosisCreada = await Dosis.findById(nuevaDosis._id)
                                    .populate('medicamento', 'nombre concentracion presentacion')
                                    .lean();
    return dosisCreada;

  } catch (error) {
    // Si algo falla, revertimos la transacción
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error en createDosis service:', error);
    throw new Error(error.message || 'Error al crear la dosis');
  } finally {
    // Cerramos la sesión
    if (session) {
      session.endSession();
    }
  }
};

module.exports = {
  getDosisByUser,
  createDosis,
};