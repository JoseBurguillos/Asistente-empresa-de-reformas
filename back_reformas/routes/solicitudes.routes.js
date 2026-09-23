const express = require('express');

const {
  crearSolicitud,
  actualizarSolicitud,
  listarSolicitudes,
  obtenerSolicitud
} = require('../controllers/solicitudes.controller');

const router = express.Router();

// Angular: lista todas las solicitudes
router.get('/', listarSolicitudes);

// Angular: detalle de una solicitud concreta
router.get('/:id', obtenerSolicitud);

// n8n: crea una nueva solicitud al confirmar el cliente
router.post('/', crearSolicitud);

// Angular: actualiza estado, notas internas o presupuesto
router.patch('/:id', actualizarSolicitud);

module.exports = router;