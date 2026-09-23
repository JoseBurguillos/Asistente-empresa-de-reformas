const express = require('express');
const {
  crearFoto,
  listarFotos
} = require('../controllers/foto.controller.js');

const router = express.Router();

router.post('/:solicitudId/fotos', crearFoto);
router.get('/:solicitudId/fotos', listarFotos);

module.exports = router;