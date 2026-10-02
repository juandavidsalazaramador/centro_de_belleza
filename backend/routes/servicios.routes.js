const router = require('express').Router();
const { body } = require('express-validator');

const validate = require('../middleware/validate');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/servicios.controller');

function reglas(esEdicion) {
  const campo = (nombre) => (esEdicion ? body(nombre).optional() : body(nombre));
  return [
    campo('name').trim().notEmpty().withMessage('El nombre del servicio es obligatorio.'),
    campo('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0.'),
    campo('duration')
      .isInt({ min: 15, max: 480 })
      .withMessage('La duración debe ser un número entero entre 15 y 480 minutos.'),
    body('category').optional().trim().isLength({ max: 40 }).withMessage('La categoría es demasiado larga.'),
    body('description').optional().trim().isLength({ max: 300 }).withMessage('La descripción es demasiado larga.'),
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