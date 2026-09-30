const express = require('express');
const {
  crearFoto,
  listarFotos
} = require('../controllers/foto.controller.js');

const { requerirAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/:solicitudId/fotos', crearFoto);
router.get('/:solicitudId/fotos', requerirAdmin, listarFotos);

module.exports = router;