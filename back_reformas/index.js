require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');

const { sequelize, Usuario } = require('./models');

const solicitudesRouter = require('./routes/solicitudes.routes.js');
const clientesRouter = require('./routes/clientes.routes.js');
const fotosRouter = require('./routes/fotos.routes.js');
const disenosIaRouter = require('./routes/diseno-ia.routes.js');
const correccionesIaRouter = require('./routes/correcciones-ia.routes.js');
const authRouter = require('./routes/auth.routes.js');

const app = express();

app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/solicitudes', solicitudesRouter);
app.use('/api/solicitudes', fotosRouter);
app.use('/api/solicitudes', disenosIaRouter);
app.use('/api/correcciones-ia', correccionesIaRouter);

app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.status || 500).json({
    ok: false,
    error: error.message || 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 3001;

async function aplicarMigraciones() {
  const queryInterface = sequelize.getQueryInterface();
  const columnas = await queryInterface.describeTable('solicitudes');

  if (!columnas.fotos_estado_actual) {
    await queryInterface.addColumn('solicitudes', 'fotos_estado_actual', {
      type: DataTypes.STRING(30),
      allowNull: true
    });
  }

  if (!columnas.fotos_referencia) {
    await queryInterface.addColumn('solicitudes', 'fotos_referencia', {
      type: DataTypes.STRING(30),
      allowNull: true
    });
  }

  if (!columnas.fecha_visita) {
    await queryInterface.addColumn('solicitudes', 'fecha_visita', {
      type: DataTypes.DATE,
      allowNull: true
    });
  }

  if (!columnas.visita_estado) {
    await queryInterface.addColumn('solicitudes', 'visita_estado', {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'sin_programar'
    });
  }

  if (!columnas.visita_respuesta_cliente) {
    await queryInterface.addColumn('solicitudes', 'visita_respuesta_cliente', {
      type: DataTypes.TEXT,
      allowNull: true
    });
  }

  if (!columnas.visita_fechas_alternativas) {
    await queryInterface.addColumn('solicitudes', 'visita_fechas_alternativas', {
      type: DataTypes.TEXT,
      allowNull: true
    });
  }

  if (!columnas.visita_respuesta_at) {
    await queryInterface.addColumn('solicitudes', 'visita_respuesta_at', {
      type: DataTypes.DATE,
      allowNull: true
    });
  }

  // Conserva los valores existentes al adoptar el nombre que se muestra
  // al usuario en el chatbot y en el panel de gestión.
  if (columnas.fecha_inicio && !columnas.fecha_orientativa) {
    await queryInterface.renameColumn(
      'solicitudes',
      'fecha_inicio',
      'fecha_orientativa'
    );
  } else if (!columnas.fecha_orientativa) {
    await queryInterface.addColumn('solicitudes', 'fecha_orientativa', {
      type: DataTypes.STRING(100),
      allowNull: true
    });
  }
}

async function crearAdminInicial() {
  const existente = await Usuario.findOne({ where: { usuario: 'admin' } });
  if (existente) return;

  await Usuario.create({
    usuario: 'admin',
    password_hash: await bcrypt.hash('admin1234', 12),
    rol: 'admin'
  });
  console.log('Usuario administrador inicial creado');
}

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await crearAdminInicial();
    await aplicarMigraciones();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend funcionando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar la base de datos:', error);
  }
}

iniciarServidor();
