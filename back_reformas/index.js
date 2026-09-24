require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { DataTypes } = require('sequelize');

const { sequelize } = require('./models');

const solicitudesRouter = require('./routes/solicitudes.routes.js');
const clientesRouter = require('./routes/clientes.routes.js');
const fotosRouter = require('./routes/fotos.routes.js');
const disenosIaRouter = require('./routes/diseno-ia.routes.js');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/clientes', clientesRouter);
app.use('/api/solicitudes', solicitudesRouter);
app.use('/api/solicitudes', fotosRouter);
app.use('/api/solicitudes', disenosIaRouter);

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
}

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await aplicarMigraciones();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend funcionando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar la base de datos:', error);
  }
}

iniciarServidor();
