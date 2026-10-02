require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const { MONGODB_URI, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI || !ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ Faltan MONGODB_URI, ADMIN_USERNAME, ADMIN_EMAIL o ADMIN_PASSWORD en el .env');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  let admin = await User.findOne({
    $or: [{ username: ADMIN_USERNAME.toLowerCase() }, { email: ADMIN_EMAIL.toLowerCase() }],
  });

  if (admin) {
    // Si ya existe, se asegura el rol y se restablece la contraseña del .env
    admin.role = 'admin';
    admin.password = ADMIN_PASSWORD;
    await admin.save();
    console.log('♻️  El administrador ya existía: rol y contraseña actualizados desde el .env');
  } else {
    admin = new User({
      nombre: 'Administrador',
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    await admin.save();
    console.log('✅ Administrador creado');
  }

  console.log(`   Usuario: ${ADMIN_USERNAME}  |  Email: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error en el seed:', err.message);
  process.exit(1);
});