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
// --- Verificar variables de entorno obligatorias ---
const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
    console.error(`❌ Faltan variables en el archivo .env: ${missing.join(', ')}`);
    process.exit(1);
}

// --- NUEVO: Endpoint para la API de servicios con respaldo legacy ---
app.get('/api/services', async (req, res) => {
    try {
        // Si tienes un modelo de Mongoose, puedes consultar la BD aquí:
        // const services = await Service.find();
        // if (services && services.length > 0) return res.json(services);

        // Respaldo por defecto para que la página cargue de inmediato
        const defaultServices = [
            { id: 1, name: 'Corte & Peinado Dama', price: 45000, duration: '60 min', description: 'Corte personalizado y peinado profesional.' },
            { id: 2, name: 'Manicura Spa Rusa', price: 35000, duration: '45 min', description: 'Cuidado avanzado de uñas con técnica rusa.' },
            { id: 3, name: 'Pedicura Completa', price: 40000, duration: '50 min', description: 'Hidratación profunda y estética para pies.' },
            { id: 4, name: 'Maquillaje Profesional', price: 80000, duration: '60 min', description: 'Maquillaje para toda ocasión.' }
        ];
        
        res.json(defaultServices);
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

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
