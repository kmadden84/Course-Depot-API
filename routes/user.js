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
      return res.json({ 'First Name': user.firstName, 'Last Name': user.lastName, 'Email': user.emailAddress });
    }
  });
});

router.post('/', function (req, res) {
  User.create(req.body).then(function (user) {
    return res.location('/').status(201).end();
  }).catch(function (err) {
    if (err.name === "SequelizeValidationError") {
      return res.json({ 'Error': err.message });
    } else {
      throw err;
    }
  }).catch(function (err) {
    res.json({ 'Error': err });
  });
});

module.exports = router;
