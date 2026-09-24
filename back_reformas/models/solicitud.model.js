const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Solicitud = sequelize.define('Solicitud', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // Cliente al que pertenece esta solicitud
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },

  // Estado que controla el equipo desde Angular
  estado: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'nueva'
  },

  // Clasificación que detectará el bot
  tipo_proyecto: {
    type: DataTypes.STRING(50),
    allowNull: true
    // Ejemplos: reforma_integral, reforma_parcial,
    // construccion_nueva, ampliacion, diseno_ia
  },

  tipo_obra: {
    type: DataTypes.STRING(100),
    allowNull: true
    // Ejemplos: dormitorio, cambiar_suelo, pintura, cocina
  },

  estancia: {
    type: DataTypes.STRING(100),
    allowNull: true
    // Ejemplos: dormitorio, baño, cocina, salón
  },

  medidas: {
    type: DataTypes.TEXT,
    allowNull: true
    // Ejemplo: "4 m x 3 m, altura 2,5 m"
  },

  zona: {
    type: DataTypes.STRING(150),
    allowNull: true
  },

  vivienda_habitada: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  contacto_preferido: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  fotos_estado_actual: {
    type: DataTypes.STRING(30),
    allowNull: true
  },

  fotos_referencia: {
    type: DataTypes.STRING(30),
    allowNull: true
  },

  // Solo se guarda lo que diga el cliente.
  // El bot nunca calcula ni envía presupuestos.
  presupuesto: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: null
  },

  fecha_inicio: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  detalles: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  drive_folder_id: {
    type: DataTypes.STRING(200),
    allowNull: true
  },

  // Solo visible para el jefe/equipo desde Angular
  notas_internas: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  canal_origen: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'whatsapp'
  }
}, {
  tableName: 'solicitudes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Solicitud;
