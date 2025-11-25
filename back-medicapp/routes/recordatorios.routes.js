const express = require('express');
const router = express.Router();
const { validateJWT } = require('../middlewares/validateJWT');

/**
 * POST /api/recordatorios/activar
 * Activa los recordatorios SMS para un usuario
 */
router.post('/activar', validateJWT, async (req, res) => {
  try {
    const { Usuario } = require('../models/Schema');
    console.log(req)
    const usuarioId = req.usuario._id;

    // Buscar el usuario
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Simular activación de notificaciones SMS
    const mensajeSimulado = {
      to: usuario.telefono || 'No especificado',
      message: `Hola ${usuario.nombre}, tus recordatorios de medicamentos están activados. Te enviaremos mensajes SMS cuando sea necesario.`,
      status: 'enviado',
      timestamp: new Date()
    };

    console.log('📱 SMS SIMULADO:', mensajeSimulado);

    res.status(200).json({
      message: 'Notificaciones activadas correctamente',
      sms: mensajeSimulado,
      usuario: {
        nombre: usuario.nombre,
        telefono: usuario.telefono
      }
    });
  } catch (error) {
    console.error('Error al activar recordatorios:', error);
    res.status(500).json({ message: 'Error al activar recordatorios' });
  }
});

/**
 * POST /api/recordatorios/enviar
 * Envía un recordatorio SMS simulado
 */
router.post('/enviar', validateJWT, async (req, res) => {
  try {
    const { Usuario } = require('../models/Schema');
    const { mensaje, medicamento } = req.body;
    const usuarioId = req.userId;

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Simular envío de SMS
    const smsSimulado = {
      to: usuario.telefono || 'No especificado',
      message: mensaje || `Recordatorio: Es hora de tomar tu medicamento ${medicamento || ''}`,
      status: 'enviado',
      timestamp: new Date()
    };

    console.log('📱 SMS RECORDATORIO SIMULADO:', smsSimulado);

    res.status(200).json({
      message: 'Recordatorio enviado correctamente',
      sms: smsSimulado
    });
  } catch (error) {
    console.error('Error al enviar recordatorio:', error);
    res.status(500).json({ message: 'Error al enviar recordatorio' });
  }
});

/**
 * GET /api/recordatorios/historial
 * Obtiene el historial de recordatorios (simulado)
 */
router.get('/historial', validateJWT, async (req, res) => {
  try {
    const { Usuario } = require('../models/Schema');
    const usuarioId = req.userId;

    const usuario = await Usuario.findById(usuarioId)
      .populate('medicamentos.medicamento', 'nombre concentracion');

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar historial simulado basado en los medicamentos del usuario
    const historialSimulado = usuario.medicamentos.map((med, index) => ({
      id: index + 1,
      medicamento: med.medicamento?.nombre || 'Desconocido',
      mensaje: `Recordatorio: Tomar ${med.medicamento?.nombre}`,
      fechaEnvio: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
      estado: 'enviado'
    }));

    res.status(200).json({
      message: 'Historial obtenido correctamente',
      historial: historialSimulado,
      total: historialSimulado.length
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ message: 'Error al obtener historial' });
  }
});

module.exports = router;