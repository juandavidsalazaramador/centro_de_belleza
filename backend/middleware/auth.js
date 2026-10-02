const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1) ¿Quién eres? Verifica el JWT y carga al usuario en req.user
async function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Debes iniciar sesión para acceder a este recurso.' });
  }

  // Si el token es inválido o vencido, jwt.verify lanza un error
  // y errorHandler lo convierte en un 401.
  const payload = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(payload.id);
  if (!user) {
    return res.status(401).json({ message: 'La cuenta de este token ya no existe.' });
  }

  req.user = user; // el rol real viene de MongoDB
  next();
}

// 2) ¿Qué puedes hacer? Solo deja pasar a los administradores
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'No tienes permisos para acceder al panel administrativo.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin };