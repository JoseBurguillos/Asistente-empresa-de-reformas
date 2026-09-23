const express = require('express');
const {
  obtenerContextoCliente
} = require('../controllers/clientes.controller');

const router = express.Router();

router.get('/:telefono/contexto', obtenerContextoCliente);

module.exports = router;