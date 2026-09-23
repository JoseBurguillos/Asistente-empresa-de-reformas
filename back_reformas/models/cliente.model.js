const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  telefono: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
    validate: {
      is: /^\d{8,15}$/
    }
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  idioma: {
    type: DataTypes.STRING(10),
    defaultValue: 'es',
    allowNull: false
  }
}, {
  tableName: 'clientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Cliente;