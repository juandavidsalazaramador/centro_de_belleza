const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del servicio es obligatorio.'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres.'],
      maxlength: [60, 'El nombre es demasiado largo.'],
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [40, 'La categoría es demasiado larga.'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'La descripción es demasiado larga.'],
    },
    // Precio en pesos colombianos (número entero, ej. 30000)
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio.'],
      min: [0, 'El precio no puede ser negativo.'],
    },
    // Duración en minutos: es la base del control de conflictos.
    duration: {
      type: Number,
      required: [true, 'La duración es obligatoria.'],
      min: [15, 'La duración mínima es de 15 minutos.'],
      max: [480, 'La duración máxima es de 480 minutos (8 horas).'],
      validate: {
        validator: Number.isInteger,
        message: 'La duración debe ser un número entero de minutos.',
      },
    },
    status: {
      type: String,
      enum: { values: ['Activo', 'Inactivo'], message: 'Estado no válido.' },
      default: 'Activo',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Servicio', servicioSchema);