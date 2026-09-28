const express = require('express');
const {
  crearCorreccion,
  buscarEjemplos,
  listarCorrecciones,
  cambiarEstadoCorreccion
} = require('../controllers/correcciones-ia.controller');

const router = express.Router();

router.get('/ejemplos', buscarEjemplos);
router.get('/', listarCorrecciones);
router.post('/', crearCorreccion);
router.patch('/:id', cambiarEstadoCorreccion);

module.exports = router;
