'use strict';

const express = require('express');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { sequelize, models } = require('../db');
const Sequelize = require('sequelize');
const { User, Course } = models;
const router = express.Router();
const authUser = require('./authenticateUser.js');



router.get('/', authUser.authenticateUser, (req, res) => {
  const credentials = auth(req);
  User.findOne({
    where: {
      emailAddress: credentials.name
    }
  }).then(async function (user) {
    if (!user) {
      return res.sendStatus(400);
    } else {
      return res.json({ 'First Name': user.firstName, 'Last Name': user.lastName, 'Email': user.emailAddress, 'Pass': user.password });
    }
  });
});

router.post('/', function (req, res) {
  User.create(req.body).then(function (user) {
    return res.location('/').status(200).json({ 'Message': 'User Added' });
  }).catch(function (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ 'Error': err.message  });
    } else {
      throw err;
    }
  }).catch(function (err) {
    res.json({ 'Error': err });
  });
});

module.exports = router;
