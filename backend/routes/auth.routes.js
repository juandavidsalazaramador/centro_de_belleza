const router = require('express').Router();
const { body } = require('express-validator');

const validate = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');
const { register, login, adminLogin, me } = require('../controllers/auth.controller');

const reglasRegistro = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('email').trim().isEmail().withMessage('El email no es válido.'),
  body('telefono')
    .optional({ values: 'falsy' })
    .matches(/^[0-9+\s-]{7,15}$/)
    .withMessage('El teléfono no es válido.'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('No puedes usar esta contraseña: debe tener al menos 6 caracteres.'),
];

const reglasLogin = [
  body('email').trim().isEmail().withMessage('El email no es válido.'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
];

const reglasAdminLogin = [
  body('usuario')
    .isString()
    .trim()
    .matches(/^[a-zA-Z0-9_.-]{3,30}$/)
    .withMessage('Ingresa un nombre de usuario administrativo válido.'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
];

router.post('/register', reglasRegistro, validate, register);
router.post('/login', reglasLogin, validate, login);
router.post('/admin-login', reglasAdminLogin, validate, adminLogin);
router.get('/me', authenticateToken, me);


module.exports = router;