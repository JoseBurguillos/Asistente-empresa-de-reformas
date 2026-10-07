const express = require('express');
const {
  listarClientes,
  obtenerContextoCliente
} = require('../controllers/clientes.controller');
const { requerirAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requerirAdmin, listarClientes);
router.get('/:telefono/contexto', obtenerContextoCliente);

module.exports = router;
