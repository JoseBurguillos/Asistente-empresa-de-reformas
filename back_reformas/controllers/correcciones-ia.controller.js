const crypto = require('node:crypto');
const { CorreccionIA } = require('../models');

const normalizar = (valor) => String(valor ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const palabrasVacias = new Set([
  'a', 'al', 'cambiar', 'de', 'del', 'el', 'en', 'hacer', 'kambiar', 'kiero',
  'kitar', 'la', 'las', 'lo', 'los', 'me', 'mi', 'para', 'poner', 'por', 'que',
  'quiero', 'quitar', 'reformar', 'se', 'un', 'una', 'y'
]);

const tokenizar = (texto) => new Set(
  normalizar(texto)
    .split(' ')
    .filter((palabra) => palabra.length > 1 && !palabrasVacias.has(palabra))
);

const puntuarSimilitud = (mensaje, contexto, ejemplo) => {
  const actual = normalizar(mensaje);
  const anterior = normalizar(ejemplo.mensaje_original);
  const contextoActual = normalizar(contexto);
  const contextoAnterior = normalizar(ejemplo.contexto);

  if (!actual || !anterior) return 0;

  let puntuacion = 0;
  if (actual === anterior) puntuacion += 1;
  else if (actual.includes(anterior) || anterior.includes(actual)) puntuacion += 0.35;

  const tokensActuales = tokenizar(actual);
  const tokensAnteriores = tokenizar(anterior);
  const interseccion = [...tokensActuales]
    .filter((token) => tokensAnteriores.has(token)).length;
  const union = new Set([...tokensActuales, ...tokensAnteriores]).size;

  if (union > 0) puntuacion += (interseccion / union) * 0.65;

  // El contexto sirve para desempatar, pero nunca debe hacer que una cocina
  // aparezca como ejemplo de un baño si no comparten ninguna palabra útil.
  if (
    contextoActual &&
    contextoActual === contextoAnterior &&
    (interseccion > 0 || actual === anterior || actual.includes(anterior) || anterior.includes(actual))
  ) {
    puntuacion += 0.05;
  }

  return puntuacion;
};

const crearCorreccion = async (req, res, next) => {
  try {
    const mensajeOriginal = String(req.body.mensaje_original || '').trim();
    const contexto = String(req.body.contexto || '').trim().slice(0, 80);
    const correccion = req.body.correccion;

    if (mensajeOriginal.length < 2 || mensajeOriginal.length > 3000) {
      return res.status(400).json({
        ok: false,
        error: 'mensaje_original debe tener entre 2 y 3000 caracteres'
      });
    }

    if (!correccion || typeof correccion !== 'object' || Array.isArray(correccion)) {
      return res.status(400).json({
        ok: false,
        error: 'correccion debe ser un objeto JSON'
      });
    }

    const clave = crypto
      .createHash('sha256')
      .update(`${normalizar(contexto)}|${normalizar(mensajeOriginal)}`)
      .digest('hex');

    const [registro, creado] = await CorreccionIA.findOrCreate({
      where: { clave },
      defaults: {
        clave,
        mensaje_original: mensajeOriginal,
        contexto,
        salida_ia: req.body.salida_ia ?? null,
        correccion,
        motivo: req.body.motivo || null,
        origen: req.body.origen || 'manual',
        activa: true
      }
    });

    if (!creado) {
      await registro.update({
        mensaje_original: mensajeOriginal,
        contexto,
        salida_ia: req.body.salida_ia ?? registro.salida_ia,
        correccion,
        motivo: req.body.motivo || registro.motivo,
        origen: req.body.origen || registro.origen,
        activa: true
      });
    }

    res.status(creado ? 201 : 200).json({
      ok: true,
      creada: creado,
      correccion: registro
    });
  } catch (error) {
    next(error);
  }
};

const buscarEjemplos = async (req, res, next) => {
  try {
    const mensaje = String(req.query.mensaje || '').trim();
    const contexto = String(req.query.contexto || '').trim();
    const limite = Math.min(Math.max(Number(req.query.limite) || 3, 1), 5);

    if (!mensaje) {
      return res.json({ ok: true, ejemplos: [] });
    }

    const registros = await CorreccionIA.findAll({
      where: { activa: true },
      order: [['updated_at', 'DESC']],
      limit: 300
    });

    const ejemplos = registros
      .map((registro) => ({
        registro,
        similitud: puntuarSimilitud(mensaje, contexto, registro)
      }))
      .filter(({ similitud }) => similitud >= 0.25)
      .sort((a, b) => b.similitud - a.similitud)
      .slice(0, limite)
      .map(({ registro, similitud }) => ({
        mensaje: registro.mensaje_original,
        contexto: registro.contexto,
        correccion: registro.correccion,
        motivo: registro.motivo,
        similitud: Number(similitud.toFixed(3))
      }));

    res.json({ ok: true, ejemplos });
  } catch (error) {
    next(error);
  }
};

const listarCorrecciones = async (req, res, next) => {
  try {
    const correcciones = await CorreccionIA.findAll({
      order: [['updated_at', 'DESC']],
      limit: 200
    });

    res.json({ ok: true, correcciones });
  } catch (error) {
    next(error);
  }
};

const cambiarEstadoCorreccion = async (req, res, next) => {
  try {
    const correccion = await CorreccionIA.findByPk(Number(req.params.id));

    if (!correccion) {
      return res.status(404).json({ ok: false, error: 'La corrección no existe' });
    }

    if (typeof req.body.activa !== 'boolean') {
      return res.status(400).json({ ok: false, error: 'activa debe ser true o false' });
    }

    await correccion.update({ activa: req.body.activa });
    res.json({ ok: true, correccion });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearCorreccion,
  buscarEjemplos,
  listarCorrecciones,
  cambiarEstadoCorreccion,
  puntuarSimilitud
};
