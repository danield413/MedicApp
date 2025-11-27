// back-medicapp/services/pedido.service.js
const { Pedido, Domiciliario, Usuario } = require('../models/Schema');

/**
 * Obtiene todos los pedidos con estado 'pendiente'. (Para Domiciliarios)
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
 * Acepta un pedido, asignando un domiciliario y actualizando el estado. (Para Domiciliarios)
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

// ============================================================================
// NUEVAS FUNCIONES PARA USUARIOS
// ============================================================================

/**
 * Crea un nuevo pedido para un usuario.
 * @param {object} datosPedido - Datos del pedido (medicamentos, direccionEntrega, etc.)
 * @param {string} usuarioId - ID del usuario que crea el pedido.
 * @returns {Promise<object>} - Promesa que resuelve al nuevo pedido creado.
 */
const crearPedido = async (datosPedido, usuarioId) => {
  try {
    const nuevoPedido = new Pedido({
      ...datosPedido,
      usuario: usuarioId,
      estadoPedido: 'pendiente', // Estado inicial
      fechaHora: new Date()
    });

    await nuevoPedido.save();

    // Añadir el pedido a la lista del usuario
    await Usuario.findByIdAndUpdate(usuarioId, {
      $push: { pedidos: nuevoPedido._id }
    });

    return nuevoPedido;
  } catch (error) {
    console.error('Error en crearPedido service:', error);
    throw new Error('Error al crear el pedido');
  }
};

/**
 * Obtiene todos los pedidos de un usuario específico.
 * @param {string} usuarioId - ID del usuario.
 * @returns {Promise<Array>} - Promesa que resuelve a un array de pedidos del usuario.
 */
const getPedidosPorUsuario = async (usuarioId) => {
  try {
    const pedidos = await Pedido.find({ usuario: usuarioId })
      .populate('domiciliario', 'nombre apellidos')
      .populate('medicamentos.medicamento', 'nombre concentracion')
      .sort({ fechaHora: -1 }); // Los más recientes primero
    return pedidos;
  } catch (error) {
    console.error('Error en getPedidosPorUsuario service:', error);
    throw new Error('Error al obtener los pedidos del usuario');
  }
};

/**
 * Actualiza un pedido de un usuario. (Solo si está 'pendiente')
 * @param {string} pedidoId - ID del pedido a actualizar.
 * @param {object} datosActualizar - Campos a actualizar (medicamentos, direccion, etc.)
 * @param {string} usuarioId - ID del usuario propietario.
 * @returns {Promise<object>} - Promesa que resuelve al pedido actualizado.
 */
const actualizarPedidoUsuario = async (pedidoId, datosActualizar, usuarioId) => {
  try {
    const pedido = await Pedido.findById(pedidoId);

    if (!pedido) {
      throw new Error('El pedido no existe');
    }

    // Verificar propiedad
    if (pedido.usuario.toString() !== usuarioId.toString()) {
      throw new Error('No tiene permiso para editar este pedido');
    }

    // Regla de negocio: Solo se puede editar si está 'pendiente'
    if (pedido.estadoPedido !== 'pendiente') {
      throw new Error('No se puede actualizar un pedido que ya está en proceso');
    }

    // Actualizar los campos permitidos
    const { medicamentos, direccionEntrega, observaciones, total } = datosActualizar;
    pedido.medicamentos = medicamentos || pedido.medicamentos;
    pedido.direccionEntrega = direccionEntrega || pedido.direccionEntrega;
    pedido.observaciones = observaciones || pedido.observaciones;
    pedido.total = total || pedido.total;
    
    await pedido.save();
    return pedido;

  } catch (error) {
    console.error('Error en actualizarPedidoUsuario service:', error);
    throw new Error(error.message || 'Error al actualizar el pedido');
  }
};

/**
 * Cancela un pedido de un usuario. (Solo si está 'pendiente')
 * @param {string} pedidoId - ID del pedido a cancelar.
 * @param {string} usuarioId - ID del usuario propietario.
 * @returns {Promise<object>} - Promesa que resuelve al pedido cancelado.
 */
const cancelarPedidoUsuario = async (pedidoId, usuarioId) => {
  try {
    const pedido = await Pedido.findById(pedidoId);

    if (!pedido) {
      throw new Error('El pedido no existe');
    }

    // Verificar propiedad
    if (pedido.usuario.toString() !== usuarioId) {
      throw new Error('No tiene permiso para cancelar este pedido');
    }

    // Regla de negocio: Solo se puede cancelar si está 'pendiente'
    if (pedido.estadoPedido !== 'pendiente') {
      throw new Error('No se puede actualizar un pedido que ya está en proceso');
    }

    pedido.estadoPedido = 'cancelado';
    await pedido.save();
    return pedido;

  } catch (error) {
    console.error('Error en cancelarPedidoUsuario service:', error);
    throw new Error(error.message || 'Error al cancelar el pedido');
  }
};

module.exports = {
  getPedidosPendientes,
  aceptarPedido,
  // Exportar nuevas funciones
  crearPedido,
  getPedidosPorUsuario,
  actualizarPedidoUsuario,
  cancelarPedidoUsuario,
};