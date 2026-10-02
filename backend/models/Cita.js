const mongoose = require('mongoose');

const ESTADOS = ['Programada', 'En proceso', 'Completada', 'Cancelada'];

const citaSchema = new mongoose.Schema(
  {
    // Referencias a las otras colecciones
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El cliente es obligatorio.'],
    },
    stylistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estilista',
      required: [true, 'El estilista es obligatorio.'],
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Servicio',
      required: [true, 'El servicio es obligatorio.'],
    },

    // Fecha "YYYY-MM-DD" y horas "HH:MM" como texto (se comparan bien alfabéticamente)
    date: {
      type: String,
      required: [true, 'La fecha es obligatoria.'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato AAAA-MM-DD.'],
    },
    timeStart: {
      type: String,
      required: [true, 'La hora de inicio es obligatoria.'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora de inicio debe tener formato HH:MM.'],
    },
    timeEnd: {
      type: String,
      required: [true, 'La hora de finalización es obligatoria.'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora de finalización debe tener formato HH:MM.'],
    },

    // Copia del precio y la duración al momento de agendar
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },

    status: {
      type: String,
      enum: { values: ESTADOS, message: 'Estado de cita no válido.' },
      default: 'Programada',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Las notas son demasiado largas.'],
      default: '',
    },
  },
  { timestamps: true }
);

// Validación extra: la cita debe terminar después de empezar (mismo día).
citaSchema.pre('validate', function () {
  if (this.timeStart && this.timeEnd && this.timeEnd <= this.timeStart) {
    this.invalidate('timeEnd', 'La cita debe terminar el mismo día, después de su hora de inicio.');
  }
});

// Índice para que la búsqueda de conflictos (estilista + fecha) sea rápida.
citaSchema.index({ stylistId: 1, date: 1, status: 1 });
citaSchema.index({ userId: 1, date: 1 });

citaSchema.statics.ESTADOS = ESTADOS;

module.exports = mongoose.model('Cita', citaSchema);