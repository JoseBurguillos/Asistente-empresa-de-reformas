const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const DisenoIA = sequelize.define('DisenoIA', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // Solicitud de reforma a la que pertenece el diseño
  solicitud_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'solicitudes',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },

  // Estancia diseñada: dormitorio, cocina, baño...
  estancia: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  // Instrucción final usada para generar el boceto elegido
  prompt: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // conversando | generando | pendiente_confirmacion | final | error
  estado: {
    type: DataTypes.STRING(40),
    allowNull: false,
    defaultValue: 'conversando'
  },

  // Modelo que genera la imagen
  modelo_ia: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  drive_folder_id: {
  type: DataTypes.STRING(200),
  allowNull: true
  },
  
  // Solo se rellena cuando el cliente confirma el boceto final
  drive_file_id: {
    type: DataTypes.STRING(200),
    allowNull: true
  },

  url_drive: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  confirmado_por_cliente: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  error: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'disenos_ia',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DisenoIA;