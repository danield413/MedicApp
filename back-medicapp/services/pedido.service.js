// back-medicapp/services/pedido.service.js
const { Pedido, Domiciliario } = require('../models/Schema');

/**
 * Obtiene todos los pedidos con estado 'pendiente'.
 * @returns {Promise<Array>} - Promesa que resuelve a un array de pedidos pendientes.
 */
const getPedidosPendientes = async () => {
  try {
    const pedidos = await Pedido.find({ estadoPedido: 'pendiente' })
      .populate('usuario', 'nombre apellidos direccion') // Trae info del usuario
      .populate('medicamentos.medicamento', 'nombre concentracion') // Trae info de los medicamentos
      .sort({ fechaHora: 1 }); // Los más antiguos primero
    return pedidos;
  } catch (error) {
    console.error('Error en getPedidosPendientes service:', error);
    throw new Error('Error al obtener los pedidos pendientes');
  }
};

/**
 * Acepta un pedido, asignando un domiciliario y actualizando el estado.
 * @param {string} pedidoId - El ID del pedido a aceptar.
 * @param {string} domiciliarioId - El ID del domiciliario que acepta.
 * @returns {Promise<object>} - Promesa que resuelve al pedido actualizado.
 */
const aceptarPedido = async (pedidoId, domiciliarioId) => {
  try {
    const pedido = await Pedido.findById(pedidoId);
    if (!pedido) {
      throw new Error('El pedido no existe');
    }

    if (pedido.estadoPedido !== 'pendiente' || pedido.domiciliario) {
      throw new Error('Este pedido ya fue aceptado o no está pendiente');
    }

    // Actualizar el pedido
    pedido.domiciliario = domiciliarioId;
    pedido.estadoPedido = 'en_preparacion';
    await pedido.save();

    // Añadir el pedido a la lista del domiciliario
    await Domiciliario.findByIdAndUpdate(domiciliarioId, {
      $push: { pedidosAsignados: pedido._id }
    });

    return pedido;
  } catch (error) {
    console.error('Error en aceptarPedido service:', error);
    throw new Error(error.message || 'Error al aceptar el pedido');
  }
};

module.exports = {
  getPedidosPendientes,
  aceptarPedido,
};