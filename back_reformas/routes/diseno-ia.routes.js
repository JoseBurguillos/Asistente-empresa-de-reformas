const express = require('express');
const {
  guardarDisenoFinal,
  listarDisenosFinales
} = require('../controllers/diseno-ia.controller');

const { requerirAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/:solicitudId/disenos/final', guardarDisenoFinal);
router.get('/:solicitudId/disenos', requerirAdmin, listarDisenosFinales);

module.exports = router;