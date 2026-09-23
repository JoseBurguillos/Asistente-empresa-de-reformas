const { Solicitud, DisenoIA } = require('../models');

const guardarDisenoFinal = async (req, res, next) => {
  try {
    const solicitudId = Number(req.params.solicitudId);

    const {
      estancia = null,
      prompt = null,
      modelo_ia = null,
      drive_folder_id = null,
      drive_file_id,
      url_drive = null
    } = req.body;

    if (!Number.isInteger(solicitudId)) {
      return res.status(400).json({
        ok: false,
        error: 'ID de solicitud inválido'
      });
    }

    if (!drive_file_id) {
      return res.status(400).json({
        ok: false,
        error: 'drive_file_id es obligatorio'
      });
    }

    const solicitud = await Solicitud.findByPk(solicitudId);

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        error: 'La solicitud no existe'
      });
    }

    // Solo hay un diseño final por estancia en cada solicitud.
    const disenoExistente = await DisenoIA.findOne({
      where: {
        solicitud_id: solicitudId,
        estancia,
        estado: 'final'
      }
    });

    const datosDiseno = {
      prompt,
      modelo_ia,
      drive_folder_id,
      drive_file_id,
      url_drive,
      estado: 'final',
      confirmado_por_cliente: true,
      error: null
    };

    if (disenoExistente) {
      await disenoExistente.update(datosDiseno);

      return res.json({
        ok: true,
        mensaje: 'Diseño final actualizado',
        diseno: disenoExistente
      });
    }

    const diseno = await DisenoIA.create({
      solicitud_id: solicitudId,
      estancia,
      ...datosDiseno
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Diseño final guardado',
      diseno
    });
  } catch (error) {
    next(error);
  }
};

const listarDisenosFinales = async (req, res, next) => {
  try {
    const solicitudId = Number(req.params.solicitudId);

    const disenos = await DisenoIA.findAll({
      where: {
        solicitud_id: solicitudId,
        estado: 'final'
      },
      order: [['updated_at', 'DESC']]
    });

    res.json({ ok: true, disenos });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  guardarDisenoFinal,
  listarDisenosFinales
};