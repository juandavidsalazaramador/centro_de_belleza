const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio.'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres.'],
      maxlength: [60, 'El nombre es demasiado largo.'],
    },
    apellido: {
      type: String,
      trim: true,
      maxlength: [60, 'El apellido es demasiado largo.'],
      default: '',
    },
    telefono: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: (v) => !v || /^[0-9+\s-]{7,15}$/.test(v),
        message: 'El teléfono no es válido.',
      },
    },
    // Opcional: un cliente creado por recepción puede no tener email.
    // "sparse" permite varios documentos sin email, pero no emails repetidos.
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      set: (v) => (v ? v : undefined),
      validate: {
        validator: (v) => !v || /^\S+@\S+\.\S+$/.test(v),
        message: 'El email no es válido.',
      },
    },
    // Nombre de usuario: solo lo usa el administrador (ej. "admin").
    // El registro público nunca lo recibe.
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      set: (v) => (v ? v : undefined),
      validate: {
        validator: (v) => !v || /^[a-z0-9_.-]{3,30}$/.test(v),
        message: 'El nombre de usuario no es válido.',
      },
    },
    // Vacío = cliente sin cuenta (creado por recepción). No puede iniciar sesión.
    // select:false evita que el hash salga en las consultas por defecto.
    password: {
      type: String,
      select: false,
      default: '',
    },
    role: {
      type: String,
      enum: { values: ['user', 'admin'], message: 'Rol no válido.' },
      default: 'user',
    },
    // Preferencias internas (ej. "tinte sin amoníaco"). Solo las ve el admin.
    notasInternas: {
      type: String,
      trim: true,
      maxlength: [500, 'Las notas son demasiado largas.'],
      default: '',
    },
  },
  { timestamps: { createdAt: 'fechaRegistro', updatedAt: 'actualizadoEn' } }
);

// Hash automático: solo si el password cambió y no está vacío.
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compara un texto plano con el hash guardado.
userSchema.methods.comparePassword = async function (plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

// Nunca devolver el password en el JSON.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);