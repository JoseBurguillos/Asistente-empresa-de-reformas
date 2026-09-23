const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Foto = sequelize.define('Foto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // Solicitud de reforma a la que pertenece la imagen
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

  // ID del archivo almacenado en Google Drive
  drive_file_id: {
    type: DataTypes.STRING(200),
    allowNull: false
  },

  // Enlace para mostrar o abrir la imagen desde Angular
  url_drive: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  nombre_archivo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  // actual | referencia | mueble | plano
  tipo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'actual'
  },

  // whatsapp | angular
  origen: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'whatsapp'
  }
}, {
  tableName: 'fotos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Foto;