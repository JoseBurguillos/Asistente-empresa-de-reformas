const jwt = require('jsonwebtoken');
const { JWT_SECRET, COOKIE_NAME } = require('../config/auth');

const requerirAdmin = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ ok: false, error: 'Debes iniciar sesión' });
  }

  try {
    const sesion = jwt.verify(token, JWT_SECRET);

    if (sesion.rol !== 'admin') {
      return res.status(403).json({ ok: false, error: 'No tienes permisos' });
    }

    req.usuario = sesion;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'La sesión ha caducado' });
  }
};

module.exports = { requerirAdmin };
