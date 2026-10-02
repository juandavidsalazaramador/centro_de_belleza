const router = require('express').Router();
const { body } = require('express-validator');

const validate = require('../middleware/validate');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/estilistas.controller');

function reglas(esEdicion) {
  const campo = (nombre) => (esEdicion ? body(nombre).optional() : body(nombre));
  return [
    campo('name').trim().notEmpty().withMessage('El nombre del estilista es obligatorio.'),
    campo('spec').trim().notEmpty().withMessage('La especialidad es obligatoria.'),
    body('phone')
      .optional({ values: 'falsy' })
      .matches(/^[0-9+\s-]{7,15}$/)
      .withMessage('El teléfono no es válido.'),
    body('color')
      .optional()
      .matches(/^#[0-9a-fA-F]{6}$/)
      .withMessage('El color debe tener formato #RRGGBB.'),
    body('status').optional().isIn(['Activo', 'Inactivo']).withMessage('Estado no válido.'),
  ];
}

// Públicas
router.get('/', c.listarActivos);

// Solo administrador
router.get('/admin/todos', authenticateToken, requireAdmin, c.listarTodos);
router.post('/', authenticateToken, requireAdmin, reglas(false), validate, c.crear);
router.put('/:id', authenticateToken, requireAdmin, reglas(true), validate, c.actualizar);
router.delete('/:id', authenticateToken, requireAdmin, c.desactivar);

module.exports = router;