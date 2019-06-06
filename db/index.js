'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);

const options = {
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
  operatorsAliases: false,
  sync: { force: false,
    alter: true
   },
  define: {
    timestamps: false,
  },
};

const sequelize = new Sequelize(options);


sequelize
    .authenticate()
    .then(function(err) {
        console.log('Connection has been established successfully.');
    })
    .then(() => {
      console.log('Synchronizing the models with the database...');
      return sequelize.sync();
    })
    .catch(function (err) {
        console.log('Unable to connect to the database:', err);
});


/**
 * Create HTTP server.
 */

/**
 * Listen on provided port, on all network interfaces.
 */


const models = {};

// Import all of the models.
fs
  .readdirSync(path.join(__dirname, 'models'))
  .forEach((file) => {
    console.info(`Importing database model from file: ${file}`);
    const model = sequelize.import(path.join(__dirname, 'models', file));
    models[model.name] = model;
  });

// If available, call method to create associations.
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    console.info(`Configuring the associations for the ${modelName} model...`);
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  models,
};