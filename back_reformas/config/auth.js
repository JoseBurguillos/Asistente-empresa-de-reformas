const crypto = require('node:crypto');

// En producción se debe definir JWT_SECRET. En desarrollo el secreto vive
// durante el proceso y las sesiones se cierran al reiniciar el backend.
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(48).toString('hex');
const COOKIE_NAME = 'reformas_admin_session';

module.exports = { JWT_SECRET, COOKIE_NAME };
