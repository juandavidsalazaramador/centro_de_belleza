const mongoose = require('mongoose');
const User = require('../models/User');
const Estilista = require('../models/Estilista');
const Servicio = require('../models/Servicio');
const Cita = require('../models/Cita');

async function mostrar(titulo, doc) {
  try {
    await doc.validate();
    console.log(`✅ ${titulo}`);
  } catch (error) {
    const primero = Object.values(error.errors)[0];
    console.log(`❌ ${titulo}: ${primero.message}`);
  }
}

const id = () => new mongoose.Types.ObjectId();

async function main() {
  await mostrar('Usuario válido', new User({ nombre: 'Juan', email: 'juan@gmail.com', password: '123456' }));
  await mostrar('Usuario sin nombre (debe fallar)', new User({ email: 'a@b.com' }));
  await mostrar('Email inválido (debe fallar)', new User({ nombre: 'Ana', email: 'esto-no-es-email' }));
  await mostrar('Role inválido (debe fallar)', new User({ nombre: 'Ana', role: 'superadmin' }));
  await mostrar('Servicio válido', new Servicio({ name: 'Corte', price: 30000, duration: 60 }));
  await mostrar('Servicio duración 5 (debe fallar)', new Servicio({ name: 'Corte', price: 30000, duration: 5 }));
  await mostrar('Estilista válido', new Estilista({ name: 'María', spec: 'Colorista' }));
  await mostrar('Cita válida', new Cita({
    userId: id(), stylistId: id(), serviceId: id(),
    date: '2026-10-15', timeStart: '10:00', timeEnd: '11:00', price: 30000, duration: 60,
  }));
  await mostrar('Cita que termina antes de empezar (debe fallar)', new Cita({
    userId: id(), stylistId: id(), serviceId: id(),
    date: '2026-10-15', timeStart: '11:00', timeEnd: '10:00', price: 30000, duration: 60,
  }));
}

main();