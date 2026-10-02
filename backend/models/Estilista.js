const mongoose = require('mongoose');

const estilistaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del estilista es obligatorio.'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres.'],
      maxlength: [60, 'El nombre es demasiado largo.'],
    },
    spec: {
      type: String,
      required: [true, 'La especialidad es obligatoria.'],
      trim: true,
      maxlength: [80, 'La especialidad es demasiado larga.'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: (v) => !v || /^[0-9+\s-]{7,15}$/.test(v),
        message: 'El teléfono no es válido.',
      },
    },
    // Desactivar en vez de borrar: así no quedan citas huérfanas.
    status: {
      type: String,
      enum: { values: ['Activo', 'Inactivo'], message: 'Estado no válido.' },
      default: 'Activo',
    },
    // Color con el que se muestra en la agenda (conservado de tu proyecto).
    color: {
      type: String,
      default: '#e11d48',
      validate: {
        validator: (v) => /^#[0-9a-fA-F]{6}$/.test(v),
        message: 'El color debe tener formato #RRGGBB.',
      },
    },
    photo: { type: String, trim: true, default: '' }, // URL opcional
  },
  { timestamps: true }
);

module.exports = mongoose.model('Estilista', estilistaSchema);