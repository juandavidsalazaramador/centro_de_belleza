const Servicio = require('../models/Servicio');

const CAMPOS = ['name', 'category', 'description', 'price', 'duration', 'status'];

// Toma solo los campos permitidos del body
function seleccionar(body) {
  const datos = {};
  for (const campo of CAMPOS) {
    if (body[campo] !== undefined) datos[campo] = body[campo];
  }
  return datos;
}

// GET /api/servicios  (público): solo los activos
async function listarActivos(req, res) {
  const servicios = await Servicio.find({ status: 'Activo' }).sort({ category: 1, name: 1 });
  res.json(servicios);
}

// GET /api/servicios/admin/todos  (admin): todos, incluso inactivos
async function listarTodos(req, res) {
  const servicios = await Servicio.find().sort({ category: 1, name: 1 });
  res.json(servicios);
}

// POST /api/servicios  (admin)
async function crear(req, res) {
  const servicio = await Servicio.create(seleccionar(req.body));
  res.status(201).json(servicio);
}

// PUT /api/servicios/:id  (admin): editar o reactivar
async function actualizar(req, res) {
  const servicio = await Servicio.findById(req.params.id);
  if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado.' });

  servicio.set(seleccionar(req.body));
  await servicio.save(); // vuelve a ejecutar las validaciones del modelo
  res.json(servicio);
}

// DELETE /api/servicios/:id  (admin): desactiva, no borra
async function desactivar(req, res) {
  const servicio = await Servicio.findById(req.params.id);
  if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado.' });

  servicio.status = 'Inactivo';
  await servicio.save();
  res.json({ message: 'Servicio desactivado.', servicio });
}

module.exports = { listarActivos, listarTodos, crear, actualizar, desactivar };