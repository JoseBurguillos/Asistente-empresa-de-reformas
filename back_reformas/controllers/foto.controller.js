const { Solicitud, Foto } = require('../models');

const crearFoto = async (req, res, next) => {
  try {
    const solicitudId = Number(req.params.solicitudId);

    const {
      drive_file_id,
      url_drive = null,
      nombre_archivo = null,
      tipo = 'actual',
      origen = 'whatsapp'
    } = req.body;

    if (!Number.isInteger(solicitudId)) {
      return res.status(400).json({ ok: false, error: 'ID de solicitud inválido' });
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

    const foto = await Foto.create({
      solicitud_id: solicitudId,
      drive_file_id,
      url_drive,
      nombre_archivo,
      tipo,
      origen
    });

    res.status(201).json({ ok: true, foto });
  } catch (error) {
    next(error);
  }
};

const listarFotos = async (req, res, next) => {
  try {
    const solicitudId = Number(req.params.solicitudId);

    const fotos = await Foto.findAll({
      where: { solicitud_id: solicitudId },
      order: [['created_at', 'DESC']]
    });

    res.json({ ok: true, fotos });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearFoto,
  listarFotos
};