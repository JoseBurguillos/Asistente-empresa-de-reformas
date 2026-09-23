const express = require('express');
const {
  guardarDisenoFinal,
  listarDisenosFinales
} = require('../controllers/diseno-ia.controller');

const router = express.Router();

router.post('/:solicitudId/disenos/final', guardarDisenoFinal);
router.get('/:solicitudId/disenos', listarDisenosFinales);

module.exports = router;