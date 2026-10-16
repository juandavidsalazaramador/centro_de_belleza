const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// --- Verificar variables de entorno obligatorias ---
const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`❌ Faltan variables en el archivo .env: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();

// --- Middlewares globales ---
app.use(cors({
  origin: ['http://localhost:9000', 'http://localhost:9001'],
  credentials: true
}));
app.use(express.json());

// --- Ruta de prueba ---
app.get('/api/health', (req, res) => {
  const estados = { 0: 'desconectada', 1: 'conectada', 2: 'conectando', 3: 'desconectando' };
  res.json({
    ok: true,
    servicio: 'Glow Studio API',
    baseDeDatos: estados[mongoose.connection.readyState],
    hora: new Date().toISOString(),
  });
});

// --- Aquí se montarán las rutas (Pasos 4 a 7) ---
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/servicios', require('./routes/servicios.routes'));
app.use('/api/estilistas', require('./routes/estilistas.routes'));
app.use('/api/citas', require('./routes/citas.routes'));

// --- Errores (siempre al final) ---
app.use(notFound);
app.use(errorHandler);

// --- Arranque: primero la base de datos, luego el servidor ---
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  });
});