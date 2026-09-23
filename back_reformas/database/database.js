const path = require('node:path');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'data', 'reformas.db'),
  logging: false
});

module.exports = sequelize;