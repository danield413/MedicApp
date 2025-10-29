// back-medicapp/controllers/pedido.controller.js
const { response } = require('express');
const pedidoService = require('../services/pedido.service.js');

const handleServiceError = (res, error, defaultStatus = 500) => {
  console.error('Error:', error.message);
  const status = error.message.includes('pedido') ? 404 : defaultStatus;
  return res.status(status).json({
    error: error.message || 'Error interno del servidor',
  });
};

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
    return handleServiceError(res, error, 400); // 400 si el pedido ya fue tomado
  }
};

module.exports = {
  getPendientes,
  aceptar,
};