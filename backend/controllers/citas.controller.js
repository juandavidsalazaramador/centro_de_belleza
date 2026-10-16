
const mongoose = require('mongoose');
const Cita = require('../models/Cita');
const Servicio = require('../models/Servicio');
const Estilista = require('../models/Estilista');

function errorHttp(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validarFecha(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function sumarMinutos(hora, minutos) {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;

  if (total >= 1440) return null;

  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(
    total % 60,
  ).padStart(2, '0')}`;
}

function manejarError(res, error) {
  const status = error.status || 500;

  if (status === 500) {
    console.error('Error en citas:', error);
  }

  return res.status(status).json({
    message:
      status === 500 ? 'Error interno del servidor.' : error.message,
  });
}

async function crear(req, res) {
  try {
    const { stylistId, serviceId, date, timeStart, notes = '' } = req.body;

    if (
      !mongoose.isValidObjectId(stylistId) ||
      !mongoose.isValidObjectId(serviceId)
    ) {
      throw errorHttp(400, 'El estilista o el servicio no son válidos.');
    }

    if (!validarFecha(date)) {
      throw errorHttp(
        400,
        'La fecha no es válida. Usa el formato AAAA-MM-DD.',
      );
    }

    if (
      typeof timeStart !== 'string' ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(timeStart)
    ) {
      throw errorHttp(400, 'La hora debe tener formato HH:MM.');
    }

    if (typeof notes !== 'string' || notes.length > 300) {
      throw errorHttp(400, 'Las notas no pueden superar los 300 caracteres.');
    }

    const [servicio, estilista] = await Promise.all([
      Servicio.findOne({ _id: serviceId, status: 'Activo' }),
      Estilista.findOne({ _id: stylistId, status: 'Activo' }),
    ]);

    if (!servicio) {
      throw errorHttp(404, 'El servicio no existe o está inactivo.');
    }

    if (!estilista) {
      throw errorHttp(404, 'El estilista no existe o está inactivo.');
    }

    const timeEnd = sumarMinutos(timeStart, servicio.duration);

    if (!timeEnd) {
      throw errorHttp(
        400,
        'La cita no puede terminar después de la medianoche.',
      );
    }

    const ahora = new Date();
    const fechaHoy = [
      ahora.getFullYear(),
      String(ahora.getMonth() + 1).padStart(2, '0'),
      String(ahora.getDate()).padStart(2, '0'),
    ].join('-');

    const horaActual = `${String(ahora.getHours()).padStart(
      2,
      '0',
    )}:${String(ahora.getMinutes()).padStart(2, '0')}`;

    if (date < fechaHoy || (date === fechaHoy && timeStart <= horaActual)) {
      throw errorHttp(400, 'Debes seleccionar una fecha y hora futuras.');
    }

    const conflicto = await Cita.findOne({
      stylistId,
      date,
      status: { $ne: 'Cancelada' },
      timeStart: { $lt: timeEnd },
      timeEnd: { $gt: timeStart },
    });

    if (conflicto) {
      throw errorHttp(409, 'El estilista ya tiene una cita en ese horario.');
    }

    const cita = await Cita.create({
      userId: req.user._id,
      stylistId,
      serviceId,
      date,
      timeStart,
      timeEnd,
      price: servicio.price,
      duration: servicio.duration,
      notes: notes.trim(),
    });

    const resultado = await Cita.findById(cita._id)
      .populate('serviceId', 'name price duration')
      .populate('stylistId', 'name spec');

    return res.status(201).json({
      message: 'Cita reservada correctamente.',
      cita: resultado,
    });
  } catch (error) {
    return manejarError(res, error);
  }
}

async function misCitas(req, res) {
  try {
    const citas = await Cita.find({ userId: req.user._id })
      .populate('serviceId', 'name price duration')
      .populate('stylistId', 'name spec')
      .sort({ date: 1, timeStart: 1 });

    return res.json(citas);
  } catch (error) {
    return manejarError(res, error);
  }
}

async function listarTodas(req, res) {
  try {
    const citas = await Cita.find()
      .populate('userId', 'nombre apellido email username')
      .populate('serviceId', 'name price duration')
      .populate('stylistId', 'name spec')
      .sort({ date: 1, timeStart: 1 });

    return res.json(citas);
  } catch (error) {
    return manejarError(res, error);
  }
}

async function cambiarEstado(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw errorHttp(400, 'El identificador de la cita no es válido.');
    }

    const { status } = req.body;
    const estados = Cita.ESTADOS;

    if (!estados.includes(status)) {
      throw errorHttp(400, 'El estado de la cita no es válido.');
    }

    const cita = await Cita.findById(req.params.id);

    if (!cita) {
      throw errorHttp(404, 'Cita no encontrada.');
    }

    if (cita.status === status) {
      return res.json({
        message: 'La cita ya tiene ese estado.',
        cita,
      });
    }

    if (cita.status === 'Completada' || cita.status === 'Cancelada') {
      throw errorHttp(
        409,
        'Una cita completada o cancelada no puede cambiar de estado.',
      );
    }

    const transicionesPermitidas = {
      Programada: ['En proceso', 'Cancelada'],
      'En proceso': ['Completada', 'Cancelada'],
    };

    const permitidos = transicionesPermitidas[cita.status] || [];

    if (!permitidos.includes(status)) {
      throw errorHttp(
        409,
        `No se permite cambiar de ${cita.status} a ${status}.`,
      );
    }

    cita.status = status;
    await cita.save();

    return res.json({
      message: 'Estado actualizado correctamente.',
      cita,
    });
  } catch (error) {
    return manejarError(res, error);
  }
}

async function eliminar(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw errorHttp(400, 'El identificador de la cita no es válido.');
    }

    const cita = await Cita.findByIdAndDelete(req.params.id);

    if (!cita) {
      throw errorHttp(404, 'Cita no encontrada.');
    }

    return res.json({
      message: 'Cita eliminada correctamente.',
      citaId: cita._id,
    });
  } catch (error) {
    return manejarError(res, error);
  }
}

module.exports = {
  crear,
  misCitas,
  listarTodas,
  cambiarEstado,
  eliminar,
};