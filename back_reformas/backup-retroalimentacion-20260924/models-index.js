const sequelize = require('../database/database');

const Cliente = require('./cliente.model');
const Solicitud = require('./solicitud.model');
const Foto = require('./foto.model');
const DisenoIA = require('./diseno-ia.model');

// Un cliente puede tener muchas solicitudes de reforma
Cliente.hasMany(Solicitud, {
  foreignKey: 'cliente_id',
  as: 'solicitudes'
});

Solicitud.belongsTo(Cliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

// Una solicitud puede tener muchas fotos de Drive
Solicitud.hasMany(Foto, {
  foreignKey: 'solicitud_id',
  as: 'fotos'
});

Foto.belongsTo(Solicitud, {
  foreignKey: 'solicitud_id',
  as: 'solicitud'
});

// Una solicitud puede tener diseños IA de distintas estancias
Solicitud.hasMany(DisenoIA, {
  foreignKey: 'solicitud_id',
  as: 'disenos_ia'
});

DisenoIA.belongsTo(Solicitud, {
  foreignKey: 'solicitud_id',
  as: 'solicitud'
});

module.exports = {
  sequelize,
  Cliente,
  Solicitud,
  Foto,
  DisenoIA
};