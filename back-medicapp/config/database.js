const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    if (this.connection) {
      console.log('📌 Usando conexión existente');
      return this.connection;
    }

    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      
      this.connection = await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('✅ Nueva conexión a MongoDB establecida');
      return this.connection;
    } catch (error) {
      console.error('❌ Error al conectar a MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    if (!this.connection) {
      return;
    }

    await mongoose.disconnect();
    this.connection = null;
    console.log('👋 Desconectado de MongoDB');
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = new Database();