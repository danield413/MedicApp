// back-medicapp/controllers/pedido.controller.js
const { response } = require('express');
const pedidoService = require('../services/pedido.service.js');

const handleServiceError = (res, error, defaultStatus = 500) => {
  console.error('Error:', error.message);
  // Ajustamos los códigos de error comunes
  let status = defaultStatus;
  if (error.message.includes('no existe')) {
    status = 404;
  } else if (error.message.includes('permiso') || error.message.includes('proceso')) {
    status = 403; // Forbidden
  } else if (error.message.includes('ya fue aceptado')) {
    status = 400; // Bad Request
  }
  
  return res.status(status).json({
    error: error.message || 'Error interno del servidor',
  });
};

// --- Controladores de Domiciliario ---

const getPendientes = async (req, res = response) => {
  try {
    const pedidos = await pedidoService.getPedidosPendientes();
    return res.status(200).json(pedidos);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

const aceptar = async (req, res = response) => {
  try {
    const { id: pedidoId } = req.params; // ID del pedido desde la URL
    const domiciliarioId = req.domiciliario.id; // ID del domiciliario desde el middleware

    const pedidoActualizado = await pedidoService.aceptarPedido(pedidoId, domiciliarioId);
    return res.status(200).json(pedidoActualizado);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

// ============================================================================
// NUEVOS CONTROLADORES PARA USUARIOS
// ============================================================================

/**
 * Crea un nuevo pedido.
 */
const crear = async (req, res = response) => {
  try {
    const datosPedido = req.body;
    const usuarioId = req.usuario.id; // ID del usuario desde validateJWT

    // Asegurarse de que la dirección de entrega venga (o tomar la del usuario)
    if (!datosPedido.direccionEntrega) {
      datosPedido.direccionEntrega = req.usuario.direccion;
    }
    
    const nuevoPedido = await pedidoService.crearPedido(datosPedido, usuarioId);
    return res.status(201).json(nuevoPedido);
  } catch (error) {
    return handleServiceError(res, error, 400); // 400 (Bad Request) si faltan datos
  }
};

/**
 * Obtiene los pedidos del usuario autenticado.
 */
const getMisPedidos = async (req, res = response) => {
  try {
    const usuarioId = req.usuario.id;
    const pedidos = await pedidoService.getPedidosPorUsuario(usuarioId);
    return res.status(200).json(pedidos);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

/**
 * Actualiza un pedido del usuario autenticado.
 */
const actualizar = async (req, res = response) => {
  try {
    const { id: pedidoId } = req.params;
    const datosActualizar = req.body;
    const usuarioId = req.usuario.id;

    const pedidoActualizado = await pedidoService.actualizarPedidoUsuario(pedidoId, datosActualizar, usuarioId);
    return res.status(200).json(pedidoActualizado);
  } catch (error) {
    return handleServiceError(res, error);
  }
};

/**
 * Cancela un pedido del usuario autenticado.
 */
const cancelar = async (req, res = response) => {
  try {
    const { id: pedidoId } = req.params;
    const usuarioId = req.usuario.id;

    const pedidoCancelado = await pedidoService.cancelarPedidoUsuario(pedidoId, usuarioId);
    return res.status(200).json(pedidoCancelado);
  } catch (error) {
    return handleServiceError(res, error);
  }
};


module.exports = {
  // Domiciliarios
  getPendientes,
  aceptar,
  // Usuarios
  crear,
  getMisPedidos,
  actualizar,
  cancelar,
};