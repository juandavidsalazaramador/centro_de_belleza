const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ No se pudo conectar a MongoDB:', error.message);
    // Sin base de datos la API no sirve de nada: cerramos el proceso.
    process.exit(1);
  }
}

module.exports = connectDB;