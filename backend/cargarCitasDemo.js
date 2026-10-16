const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config({ quiet: true });

const connectDB = require('./config/db');
const Cita = require('./models/cita');
const User = require('./models/User');
const Servicio = require('./models/Servicio');
const Estilista = require('./models/Estilista');

const MARCA = '[DEMO_GLOW_STUDIO]';
const TOTAL_CITAS = 30;
const TOTAL_CLIENTES = 10;

function fechaConDesfase(dias) {
  const fecha = new Date();
  fecha.setUTCHours(12, 0, 0, 0);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

async function crearClientes() {
  const clientes = [];

  for (let i = 1; i <= TOTAL_CLIENTES; i++) {
    const numero = String(i).padStart(2, '0');
    const email = `cliente.demo.glow${numero}@example.com`;

    let cliente = await User.findOne({ email });

    if (cliente && !cliente.notasInternas?.includes(MARCA)) {
      throw new Error(
        `El correo ${email} ya existe y no está marcado como demostración. No se modificó.`
      );
    }

    if (!cliente) {
      cliente = await User.create({
        nombre: [
          'Laura', 'Sofía', 'Valentina', 'Mariana', 'Camila',
          'Isabella', 'Gabriela', 'Daniela', 'Luciana', 'Natalia',
        ][i - 1],
        apellido: [
          'Demo', 'Prueba', 'Ejemplo', 'Muestra', 'Belleza',
          'Studio', 'Flores', 'Rojas', 'Gómez', 'Castro',
        ][i - 1],
        telefono: `300555${String(i).padStart(4, '0')}`,
        email,
        role: 'user',
        notasInternas: `${MARCA} Cliente ficticio para presentación académica.`,
      });
    }

    clientes.push(cliente);
  }

  return clientes;
}

async function ejecutar() {
  await connectDB();

  const servicios = await Servicio.find({ status: 'Activo' });
  const estilistas = await Estilista.find({ status: 'Activo' });

  if (servicios.length === 0) {
    throw new Error('No hay servicios activos. Crea o activa servicios primero.');
  }

  if (estilistas.length === 0) {
    throw new Error('No hay estilistas activos. Crea o activa estilistas primero.');
  }

  const clientes = await crearClientes();

  const fechas = [];

  // 25 citas anteriores, distribuidas a lo largo de varios meses.
  for (let i = 25; i >= 1; i--) {
    fechas.push({ dias: -i * 5, futura: false });
  }

  // 5 citas próximas.
  [1, 3, 6, 10, 14].forEach((dias) => {
    fechas.push({ dias, futura: true });
  });

  const horas = ['09:00', '11:00', '13:00', '15:00'];
  let creadas = 0;
  let existentes = 0;

  for (let i = 0; i < TOTAL_CITAS; i++) {
    const numero = String(i + 1).padStart(2, '0');
    const identificador = `${MARCA}_CITA_${numero}`;

    const yaExiste = await Cita.findOne({
      notes: identificador,
    });

    if (yaExiste) {
      existentes++;
      continue;
    }

    const cliente = clientes[i % clientes.length];
    const servicio = servicios[i % servicios.length];
    const estilista = estilistas[i % estilistas.length];
    const fecha = fechas[i];
    const timeStart = horas[i % horas.length];

    const minutosInicio =
      Number(timeStart.slice(0, 2)) * 60 +
      Number(timeStart.slice(3, 5));

    const minutosFin = minutosInicio + servicio.duration;

    if (minutosFin >= 24 * 60) {
      throw new Error(`La duración del servicio ${servicio.name} no cabe en el día.`);
    }

    const timeEnd =
      `${String(Math.floor(minutosFin / 60)).padStart(2, '0')}:` +
      `${String(minutosFin % 60).padStart(2, '0')}`;

    let status = 'Programada';

    if (!fecha.futura) {
      status = i % 6 === 0 ? 'Cancelada' : 'Completada';
    }

    await Cita.create({
      userId: cliente._id,
      stylistId: estilista._id,
      serviceId: servicio._id,
      date: fechaConDesfase(fecha.dias),
      timeStart,
      timeEnd,
      price: servicio.price,
      duration: servicio.duration,
      status,
      notes: identificador,
    });

    creadas++;
  }

  console.log('------------------------------------');
  console.log('Carga de demostración finalizada');
  console.log(`Citas nuevas: ${creadas}`);
  console.log(`Citas demo que ya existían: ${existentes}`);
  console.log(`Clientes de demostración disponibles: ${clientes.length}`);
  console.log('Las citas y clientes existentes se conservaron.');
  console.log('------------------------------------');
}

ejecutar()
  .catch((error) => {
    console.error('Error al cargar las citas:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  });