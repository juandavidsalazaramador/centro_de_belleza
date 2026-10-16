
const express = require('express');
const router = express.Router();

const citasController = require('../controllers/citas.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/', authenticateToken, citasController.crear);

router.get('/mis-citas', authenticateToken, citasController.misCitas);

router.get('/admin/todas', authenticateToken, requireAdmin, citasController.listarTodas);

router.patch('/:id/estado', authenticateToken, requireAdmin, citasController.cambiarEstado);

router.delete('/:id', authenticateToken, requireAdmin, citasController.eliminar);

module.exports = router;