'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
//var env = process.env.NODE_ENV || 'production';
//var config = require(__dirname + '/../config/config.json')[env];




const options = {
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
  // This disables the use of string based operators
  // in order to improve the security of our code.
  operatorsAliases: false,
  // This option configures Sequelize to always force the synchronization
  // of our models by dropping any existing tables.
  // sync: { force: false,
  //   alter: true
  //  },
  define: {
    // This option removes the `createdAt` and `updatedAt` columns from the tables
    // that Sequelize generates from our models. These columns are often useful
    // with production apps, so we'd typically leave them enabled, but for our
    // purposes let's keep things as simple as possible.
    timestamps: false,
  },
};

const sequelize = new Sequelize(options);

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