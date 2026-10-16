const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config({ quiet: true });

const app = require('./app');
const connectDB = require('./config/db');

// --- Verificar variables de entorno obligatorias ---
const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`❌ Faltan variables en el archivo .env: ${missing.join(', ')}`);
  process.exit(1);
}

// --- Arranque: primero la base de datos, luego el servidor ---
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('❌ No se pudo iniciar el servidor:', error.message);
  process.exitCode = 1;
});