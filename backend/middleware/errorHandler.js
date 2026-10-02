// Ruta no encontrada (404)
function notFound(req, res, next) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// Manejador central de errores
function errorHandler(err, req, res, next) {
  // JSON mal escrito en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido.' });
  }

  // Validación de Mongoose (campo requerido, formato, etc.)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: errors[0], errors });
  }

  // ID de MongoDB con formato inválido
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'El identificador enviado no es válido.' });
  }

  // Valor duplicado en un campo único (por ejemplo, email repetido)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyPattern || {})[0] || 'campo';
    return res.status(409).json({ message: `Ya existe un registro con ese valor (${campo}).` });
  }

  // Errores de JWT
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Tu sesión ha expirado. Inicia sesión de nuevo.' });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token inválido.' });
  }

  // Cualquier otro error
  const status = err.status || 500;
  if (status === 500) console.error('💥 Error no controlado:', err);

  res.status(status).json({
    message: status === 500 ? 'Error interno del servidor.' : err.message,
  });
}

module.exports = { notFound, errorHandler };