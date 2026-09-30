const express = require('express');
const { iniciarSesion, obtenerSesion, cerrarSesion } = require('../controllers/auth.controller');
const { requerirAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', iniciarSesion);
router.get('/me', requerirAdmin, obtenerSesion);
router.post('/logout', cerrarSesion);

module.exports = router;
