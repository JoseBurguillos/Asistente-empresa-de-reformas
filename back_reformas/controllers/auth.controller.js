const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { JWT_SECRET, COOKIE_NAME } = require('../config/auth');

const opcionesCookie = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/'
});

const iniciarSesion = async (req, res, next) => {
  try {
    const usuario = String(req.body.usuario || '').trim().toLowerCase();
    const contrasena = String(req.body.contrasena || '');
    const cuenta = await Usuario.findOne({ where: { usuario } });
    const valida = cuenta && await bcrypt.compare(contrasena, cuenta.password_hash);

    if (!valida) {
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { sub: cuenta.id, usuario: cuenta.usuario, rol: cuenta.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie(COOKIE_NAME, token, opcionesCookie());
    res.json({
      ok: true,
      usuario: { id: cuenta.id, usuario: cuenta.usuario, rol: cuenta.rol }
    });
  } catch (error) {
    next(error);
  }
};

const obtenerSesion = (req, res) => {
  res.json({
    ok: true,
    usuario: { id: req.usuario.sub, usuario: req.usuario.usuario, rol: req.usuario.rol }
  });
};

const cerrarSesion = (req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', path: '/' });
  res.json({ ok: true });
};

module.exports = { iniciarSesion, obtenerSesion, cerrarSesion };
