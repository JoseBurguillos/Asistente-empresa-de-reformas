const { Cliente, Solicitud, Foto, DisenoIA } = require('../models');

const normalizarTelefono = (telefono) => {
  return String(telefono || '').replace(/\D/g, '');
};

const crearSolicitud = async (req, res, next) => {
  try {
    const {
      telefono,
      sesion,
      nombre,
      email,
      idioma,
      tipo_proyecto,
      tipo_obra,
      estancia,
      medidas,
      zona,
      vivienda_habitada,
      contacto_preferido,
      fecha_inicio,
      detalles,
      drive_folder_id,
      canal_origen
    } = req.body;

    const telefonoNormalizado = normalizarTelefono(telefono || sesion);

    if (!/^\d{8,15}$/.test(telefonoNormalizado)) {
      return res.status(400).json({
        ok: false,
        error: 'El teléfono debe contener entre 8 y 15 dígitos'
      });
    }

    // Busca al cliente por teléfono. Si no existe, lo crea.
    const [cliente] = await Cliente.findOrCreate({
      where: { telefono: telefonoNormalizado },
      defaults: {
        telefono: telefonoNormalizado,
        nombre: nombre || null,
        email: email || null,
        idioma: idioma || 'es'
      }
    });

    // Actualiza únicamente datos que n8n haya recibido.
    const datosCliente = {};

    if (nombre) datosCliente.nombre = nombre;
    if (email) datosCliente.email = email;
    if (idioma) datosCliente.idioma = idioma;

    if (Object.keys(datosCliente).length > 0) {
      await cliente.update(datosCliente);
    }

    // El presupuesto no se recibe aquí.
    // Lo añadirá el jefe desde Angular después de revisar la solicitud.
    const solicitud = await Solicitud.create({
      cliente_id: cliente.id,
      estado: 'nueva',
      tipo_proyecto: tipo_proyecto || null,
      tipo_obra: tipo_obra || null,
      estancia: estancia || null,
      medidas: medidas || null,
      zona: zona || null,
      vivienda_habitada: vivienda_habitada || null,
      contacto_preferido: contacto_preferido || null,
      fecha_inicio: fecha_inicio || null,
      detalles: detalles || null,
      drive_folder_id: drive_folder_id || null,
      canal_origen: canal_origen || 'whatsapp'
    });

    res.status(201).json({
      ok: true,
      cliente,
      solicitud
    });
  } catch (error) {
    next(error);
  }
};

const actualizarSolicitud = async (req, res, next) => {
  try {
    const solicitudId = Number(req.params.id);

    const solicitud = await Solicitud.findByPk(solicitudId);

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        error: 'La solicitud no existe'
      });
    }

    // Estos campos pueden actualizarse desde Angular.
    const camposPermitidos = [
      'estado',
      'tipo_proyecto',
      'tipo_obra',
      'estancia',
      'medidas',
      'zona',
      'vivienda_habitada',
      'contacto_preferido',
      'fecha_inicio',
      'detalles',
      'drive_folder_id',
      'notas_internas',
      'presupuesto'
    ];

    const cambios = {};

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        cambios[campo] = req.body[campo];
      }
    }

    await solicitud.update(cambios);

    res.json({
      ok: true,
      solicitud
    });
  } catch (error) {
    next(error);
  }
};

const listarSolicitudes = async (req, res, next) => {
  try {
    const where = {};

    // Angular podrá filtrar, por ejemplo: /api/solicitudes?estado=nueva
    if (req.query.estado) {
      where.estado = req.query.estado;
    }

    const solicitudes = await Solicitud.findAll({
      where,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'telefono', 'email', 'idioma']
        },
        {
          model: Foto,
          as: 'fotos'
        },
        {
          model: DisenoIA,
          as: 'disenos_ia',
          where: { estado: 'final' },
          required: false
        }
      ],
      order: [['updated_at', 'DESC']]
    });

    res.json({
      ok: true,
      solicitudes
    });
  } catch (error) {
    next(error);
  }
};

const obtenerSolicitud = async (req, res, next) => {
  try {
    const solicitudId = Number(req.params.id);

    const solicitud = await Solicitud.findByPk(solicitudId, {
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'telefono', 'email', 'idioma']
        },
        {
          model: Foto,
          as: 'fotos'
        },
        {
          model: DisenoIA,
          as: 'disenos_ia',
          where: { estado: 'final' },
          required: false
        }
      ]
    });

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        error: 'La solicitud no existe'
      });
    }

    res.json({
      ok: true,
      solicitud
    });
  } catch (error) {
    next(error);
  }
};

const eliminarSolicitud = async (req, res, next) => {
  try {
    const solicitudId = Number(req.params.id);
    const solicitud = await Solicitud.findByPk(solicitudId);

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        error: 'La solicitud no existe'
      });
    }

    await solicitud.destroy();

    res.json({
      ok: true,
      mensaje: 'Solicitud eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearSolicitud,
  actualizarSolicitud,
  listarSolicitudes,
  obtenerSolicitud,
  eliminarSolicitud
};
