const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Service = require('../models/service.model'); // Asegúrate de que apunte a tu modelo

function reglas(esEdicion) {
    const campo = (nombre) => (esEdicion ? body(nombre).optional() : body(nombre));
    return [
        campo('name').trim().notEmpty().withMessage('El nombre del servicio es obligatorio.'),
        campo('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0.'),
        campo('duration').isInt({ min: 15, max: 480 }).withMessage('La duración debe ser un número entero entre 15 y 480 minutos.'),
        body('category').optional().trim().isLength({ max: 40 }).withMessage('La categoría es demasiado larga.'),
        body('description').optional().trim().isLength({ max: 300 }).withMessage('La descripción es demasiado larga.'),
        body('status').optional().isIn(['Activo', 'Inactivo']).withMessage('Estado no válido.'),
    ];
}

// GET / - Listar servicios con respaldo automático si la BD está vacía
router.get('/', async (req, res) => {
    try {
        const services = await Service.find();

        if (!services || services.length === 0) {
            return res.json([
                { id: 1, name: 'Corte & Peinado Dama', price: 45000, duration: '60 min', description: 'Corte personalizado y peinado profesional.' },
                { id: 2, name: 'Manicura Spa Rusa', price: 35000, duration: '45 min', description: 'Cuidado avanzado de uñas con técnica rusa.' },
                { id: 3, name: 'Pedicura Completa', price: 40000, duration: '50 min', description: 'Hidratación profunda y estética para pies.' },
                { id: 4, name: 'Maquillaje Profesional', price: 80000, duration: '60 min', description: 'Maquillaje para toda ocasión.' }
            ]);
        }

        res.json(services);
    } catch (error) {
        console.error('Error al listar servicios:', error);
        res.status(500).json({ error: 'Error interno al obtener los servicios' });
    }
});

// Solo administrador
router.get('/admin/todos', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener todos los servicios' });
    }
});

router.post('/', authenticateToken, requireAdmin, reglas(false), validate, async (req, res) => {
    try {
        const nuevoServicio = new Service(req.body);
        const guardado = await nuevoServicio.save();
        res.status(201).json(guardado);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el servicio' });
    }
});

router.put('/:id', authenticateToken, requireAdmin, reglas(true), validate, async (req, res) => {
    try {
        const actualizado = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el servicio' });
    }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Servicio eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el servicio' });
    }
});

module.exports = router;
