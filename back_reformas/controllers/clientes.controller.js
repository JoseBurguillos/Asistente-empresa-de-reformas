const { Op } = require('sequelize');
const { Cliente, Solicitud } = require('../models');

const listarClientes = async (_req, res, next) => {
  try {
    const clientes = await Cliente.findAll({
      attributes: ['id', 'telefono', 'nombre', 'email', 'idioma', 'created_at', 'updated_at'],
      include: [{
        model: Solicitud,
        as: 'solicitudes',
        attributes: [
          'id',
          'estado',
          'tipo_proyecto',
          'tipo_obra',
          'zona',
          'contacto_preferido',
          'created_at',
          'updated_at'
        ],
        required: false
      }],
      order: [
        ['updated_at', 'DESC'],
        [{ model: Solicitud, as: 'solicitudes' }, 'updated_at', 'DESC']
      ]
    });

    res.json({ ok: true, clientes });
  } catch (error) {
    next(error);
  }
};

const obtenerContextoCliente = async (req, res, next) => {
  try {
    const telefono = String(req.params.telefono || '').replace(/\D/g, '');

    if (!/^\d{8,15}$/.test(telefono)) {
      return res.status(400).json({
        ok: false,
        error: 'Teléfono inválido'
      });
    }

    const cliente = await Cliente.findOne({
      where: { telefono },
      include: [{
        model: Solicitud,
        as: 'solicitudes',

        // Estas son las solicitudes que el equipo todavía gestiona.
        where: {
          estado: {
            [Op.in]: ['nueva', 'en_revision', 'visita_programada', 'aceptada', 'presupuesto_preparado']
          }
        },

        // Devuelve el cliente aunque aún no tenga solicitudes.
        required: false
      }],
      order: [[
        { model: Solicitud, as: 'solicitudes' },
        'updated_at',
        'DESC'
      ]]
    });

    if (!cliente) {
      return res.json({
        existe: false,
        cliente: null,
        solicitudes_abiertas: []
      });
    }

    res.json({
      existe: true,
      cliente: {
        id: cliente.id,
        telefono: cliente.telefono,
        nombre: cliente.nombre,
        email: cliente.email,
        idioma: cliente.idioma
      },
      solicitudes_abiertas: cliente.solicitudes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarClientes,
  obtenerContextoCliente
};
