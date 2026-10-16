const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const {
    MONGODB_URI,
    ADMIN_USERNAME,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
  } = process.env;

  if (![MONGODB_URI, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD].every(
    (value) => value && value.trim()
  )) {
    throw new Error(
      'Faltan variables obligatorias del administrador en el archivo .env'
    );
  }

  await mongoose.connect(MONGODB_URI);

  const username = ADMIN_USERNAME.trim().toLowerCase();
  const email = ADMIN_EMAIL.trim().toLowerCase();

  const existing = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existing) {
    console.log(
      'Ya existe una cuenta con ese usuario o correo. No se modificaron datos.'
    );
    return;
  }

  const admin = new User({
    nombre: 'Administrador',
    username,
    email,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });

  await admin.save();

  console.log('Administrador creado correctamente.');
  console.log(`Usuario: ${username}`);
}

main()
  .catch((err) => {
    console.error('Error en el seed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });