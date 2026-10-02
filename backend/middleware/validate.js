const { validationResult } = require('express-validator');

// Corta la petición con un 400 si alguna validación falló.
function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => e.msg);
    return res.status(400).json({ message: errors[0], errors });
  }
  next();
}

module.exports = validate;