// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// 🧩 Middlewares base
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ===============================
// 🏠 Rutas principales
// ===============================
app.get('/', (req, res) => {
  res.json({
    message: '🏥 API Sistema Médico',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  const dbStatus = database.getConnection() ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Error de cast de MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido',
      details: err.message
    });
  }

  // Error de duplicado (clave única)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      error: 'Valor duplicado',
      field: field,
      message: `El ${field} ya existe en la base de datos`
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===============================
// 🚀 Función para iniciar el servidor
// ===============================
const startServer = async () => {
  try {
    await database.connect();

    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// ===============================
// 🧹 Cierre graceful del servidor
// ===============================
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} recibido. Cerrando servidor...`);
  try {
    await database.disconnect();
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar servidor:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection en:', promise, 'razón:', reason);
  gracefulShutdown('unhandledRejection');
});
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

startServer();

module.exports = app;