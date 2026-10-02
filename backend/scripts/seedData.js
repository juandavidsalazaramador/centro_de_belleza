require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const Servicio = require('../models/Servicio');
const Estilista = require('../models/Estilista');

const servicios = [
  { name: 'Corte', category: 'Cabello', description: 'Corte y estilizado según tu tipo de cabello.', price: 30000, duration: 60 },
  { name: 'Tinte', category: 'Color', description: 'Coloración completa con productos profesionales.', price: 80000, duration: 120 },
  { name: 'Peinado', category: 'Cabello', description: 'Peinado para eventos y ocasiones especiales.', price: 40000, duration: 45 },
  { name: 'Manicure', category: 'Uñas', description: 'Limpieza, forma y esmaltado de manos.', price: 25000, duration: 45 },
  { name: 'Pedicure', category: 'Uñas', description: 'Cuidado y esmaltado de pies.', price: 30000, duration: 60 },
  { name: 'Maquillaje', category: 'Maquillaje', description: 'Maquillaje profesional para cualquier ocasión.', price: 70000, duration: 60 },
];

const estilistas = [
  { name: 'María', spec: 'Colorista y cortes', phone: '3001112233', color: '#e11d48' },
  { name: 'Carlos', spec: 'Manicure y pedicure', phone: '3002223344', color: '#0ea5e9' },
  { name: 'Andrea', spec: 'Maquillaje y peinados', phone: '3003334455', color: '#a855f7' },
];

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Falta MONGODB_URI en el .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);

  if ((await Servicio.countDocuments()) === 0) {
    await Servicio.insertMany(servicios);
    console.log(`✅ ${servicios.length} servicios creados`);
  } else {
    console.log('↩️  Ya hay servicios: no se agregó nada');
  }

  if ((await Estilista.countDocuments()) === 0) {
    await Estilista.insertMany(estilistas);
    console.log(`✅ ${estilistas.length} estilistas creados`);
  } else {
    console.log('↩️  Ya hay estilistas: no se agregó nada');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});