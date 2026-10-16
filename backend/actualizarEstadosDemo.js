
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config({ quiet: true });

const connectDB = require('./config/db');
const Cita = require('./models/cita');

const MARCA = '[DEMO_GLOW_STUDIO]';
const TOTAL_CITAS = 30;

async function ejecutar() {
  try {
    await connectDB();

    const citas = await Cita.find({
      notes: {
        $in: Array.from({ length: TOTAL_CITAS }, (_, i) =>
          `${MARCA}_CITA_${String(i + 1).padStart(2, '0')}`
        ),
      },
    });

    if (citas.length !== TOTAL_CITAS) {
      throw new Error(
        `Se esperaban ${TOTAL_CITAS} citas demo, pero se encontraron ${citas.length}. No se modificó ningún estado.`
      );
    }

    const operaciones = citas.map((cita) => {
      const numero = Number(cita.notes.slice(-2));

      let status;

      if (numero >= 1 && numero <= 10) {
        status = 'Cancelada';
      } else if (numero >= 11 && numero <= 20) {
        status = 'En proceso';
      } else {
        status = 'Completada';
      }

      return {
        updateOne: {
          filter: { _id: cita._id, notes: cita.notes },
          update: { $set: { status } },
        },
      };
    });

    const resultado = await Cita.bulkWrite(operaciones);

    const resumen = await Cita.aggregate([
      {
        $match: {
          notes: {
            $in: Array.from({ length: TOTAL_CITAS }, (_, i) =>
              `${MARCA}_CITA_${String(i + 1).padStart(2, '0')}`
            ),
          },
        },
      },
      { $group: { _id: '$status', cantidad: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log('\nEstados de las citas demo actualizados.');
    console.log(`Citas encontradas: ${citas.length}`);
    console.log(`Citas modificadas: ${resultado.modifiedCount}`);
    console.log('\nResumen final:');

    for (const estado of resumen) {
      console.log(`${estado._id}: ${estado.cantidad}`);
    }
  } finally {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  }
}

ejecutar().catch((error) => {
  console.error('Error:', error.message);
  process.exitCode = 1;
});