const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Crea el JWT. Dentro solo va el id y el rol; nunca la contraseña.
function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

// POST /api/auth/register  → crear cuenta (siempre role "user")
async function register(req, res) {
  const { nombre, apellido, telefono, email, password } = req.body;

  // IMPORTANTE: se arma el usuario campo por campo.
  // Si llega "role" o "username" en el body, simplemente se ignora.
  const user = new User({
    nombre,
    apellido,
    telefono,
    email,
    password,
    role: 'user',
  });
  await user.save(); // el hash de la contraseña se hace en el modelo

  res.status(201).json({ token: signToken(user), user });
}

// POST /api/auth/login  → iniciar sesión con email y contraseña
async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  const ok = user && (await user.comparePassword(password));

  if (!ok) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
  }

  if (user.role !== 'user') {
    return res.status(403).json({
      message: 'Esta cuenta debe usar el acceso administrativo.',
    });
  }

  res.json({ token: signToken(user), user });
}

// POST /api/auth/admin-login  → acceso administrativo (usuario + contraseña)
async function adminLogin(req, res) {
  const { usuario, password } = req.body;
  const clave = usuario.trim().toLowerCase();

  const user = await User.findOne({ username: clave }).select('+password');
  const ok = user && (await user.comparePassword(password));

  if (!ok) {
    return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'No tienes permisos para acceder al panel administrativo.' });
  }

  res.json({ token: signToken(user), user });
}

// GET /api/auth/me  → datos de la sesión actual (el frontend lo usa al recargar)
async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, adminLogin, me };