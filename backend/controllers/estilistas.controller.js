const Estilista = require('../models/Estilista');

const CAMPOS = ['name', 'spec', 'phone', 'status', 'color', 'photo'];

function seleccionar(body) {
  const datos = {};
  for (const campo of CAMPOS) {
    if (body[campo] !== undefined) datos[campo] = body[campo];
  }
  return datos;
}

// GET /api/estilistas  (público): solo los activos
async function listarActivos(req, res) {
  const estilistas = await Estilista.find({ status: 'Activo' }).sort({ name: 1 });
  res.json(estilistas);
}

// GET /api/estilistas/admin/todos  (admin)
async function listarTodos(req, res) {
  const estilistas = await Estilista.find().sort({ name: 1 });
  res.json(estilistas);
}

// POST /api/estilistas  (admin)
async function crear(req, res) {
  const estilista = await Estilista.create(seleccionar(req.body));
  res.status(201).json(estilista);
}

// PUT /api/estilistas/:id  (admin): editar o reactivar
async function actualizar(req, res) {
  const estilista = await Estilista.findById(req.params.id);
  if (!estilista) return res.status(404).json({ message: 'Estilista no encontrado.' });

  estilista.set(seleccionar(req.body));
  await estilista.save();
  res.json(estilista);
}

// DELETE /api/estilistas/:id  (admin): desactiva, no borra
async function desactivar(req, res) {
  const estilista = await Estilista.findById(req.params.id);
  if (!estilista) return res.status(404).json({ message: 'Estilista no encontrado.' });

  estilista.status = 'Inactivo';
  await estilista.save();
  res.json({ message: 'Estilista desactivado.', estilista });
}

module.exports = { listarActivos, listarTodos, crear, actualizar, desactivar };