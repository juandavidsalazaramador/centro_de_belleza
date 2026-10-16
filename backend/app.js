require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const allowedOrigins = [
  'http://localhost:9000',
  'http://localhost:9001',
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/api/health', (req, res) => {
  const estados = { 0: 'desconectada', 1: 'conectada', 2: 'conectando', 3: 'desconectando' };
  res.json({
    ok: true,
    servicio: 'Glow Studio API',
    baseDeDatos: estados[mongoose.connection.readyState],
    hora: new Date().toISOString(),
  });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/servicios', require('./routes/servicios.routes'));
app.use('/api/estilistas', require('./routes/estilistas.routes'));
app.use('/api/citas', require('./routes/citas.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
