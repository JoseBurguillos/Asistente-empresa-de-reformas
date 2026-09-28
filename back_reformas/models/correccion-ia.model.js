const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const CorreccionIA = sequelize.define('CorreccionIA', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  clave: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  mensaje_original: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contexto: {
    type: DataTypes.STRING(80),
    allowNull: false,
    defaultValue: ''
  },
  salida_ia: {
    type: DataTypes.JSON,
    allowNull: true
  },
  correccion: {
    type: DataTypes.JSON,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  origen: {
    type: DataTypes.STRING(40),
    allowNull: false,
    defaultValue: 'manual'
  },
  activa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'correcciones_ia',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CorreccionIA;
