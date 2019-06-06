'use strict';

const express = require('express');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { sequelize, models } = require('../db');
const Sequelize = require('sequelize');
const { User, Course } = models;
const router = express.Router();
const authUser = require('./authenticateUser.js');



router.get('/', (req, res) => {
  Course.findAll({
    order: [["id", "ASC"]],
    attributes: {
      exclude: ['userId']
    },
    include: [
      {
        model: User,
       // as: 'userId',
        attributes: {
          exclude: ['id', 'password']
        }
      }
    ]
  }).then(function (courses) {
    return res.json(courses)
  }).catch(function (err) {
    res.send(500);
  });
});

router.get('/:id', (req, res) => {
  const courseId = req.params.id;
  Course.findAll({
    order: [["description", "DESC"]],
    where: {
      id: req.params.id
    },
    attributes: {
      exclude: ['userId']
    },
    include: [
      {
        model: User,
        //as: 'userId',
        attributes: {
          exclude: ['id', 'password']
        }
      }
    ]
  }).then(function (courses) {
    if (!courses.length) {
      return res.json({ 'Error': 'No Course Found With This Id' });
    } else {
      return res.json(courses)
    }
  }).catch(function (err) {
    res.send(500);
  });
});

router.post('/', authUser.authenticateUser, function (req, res) {
  const credentials = auth(req);
  User.findOne({
    where: {
      emailAddress: credentials.name
    }
  }).then(async function (user) {
      Course.create({
        title: req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        materialsNeeded: req.body.materialsNeeded,
        userId: user.id
      }).then(function (course) {
        return res.location('/').status(201).end()
      }).catch(function (err) {
        if (err.name === "SequelizeValidationError") {
          return res.json({ 'Error': err.message });
        } else {
          throw err;
        }
      }).catch(function (err) {
        res.send(500);
      });
  });
});
router.put('/:id', authUser.authenticateUser, function (req, res) {
  const credentials = auth(req);
  User.findOne({
    where: {
      emailAddress: credentials.name
    }
  }).then(async function (user) {
      Course.findByPk(req.params.id).then(function (course) {
        if (!req.body.title || !req.body.description) {
          return res.status(400).json({ 'Error': 'Title and Description are required' }).end()
        } else if (course && course.userId !== user.id) {
          return res.status(400).json({ 'Error': 'Only the course creator may update the course' }).end()
        }
        else if (course) {
          course.update({
            title: req.body.title,
            description: req.body.description,
            estimatedTime: req.body.estimatedTime,
            materialsNeeded: req.body.materialsNeeded,
            userId: user.id
          }).then(function (course) {
            return res.status(201).end()
          }).catch(function (err) {
            if (err.name === "SequelizeValidationError") {
              return res.json({ 'Error': err.message });
            } else {
              throw err;
            }
          }).catch(function (err) {
            res.send(500);
          });
        } else {
          return res.json({ 'Error': 'This course does not exist' });
        }
      });
  });
});
router.delete("/:id", authUser.authenticateUser, function (req, res, next) {
  const credentials = auth(req);
  User.findOne({
    where: {
      emailAddress: credentials.name
    }
  }).then(async function (user) {
      Course.findByPk(req.params.id).then(function (course) {
        if (course && course.userId !== user.id) {
          return res.status(400).json({ 'Error': 'Only the course creator may delete the course' }).end()
        }
        else if (course) {
          return course.destroy().then(function (course) {
            return res.status(201).end();
          });
        } else {
          return res.json({ 'Error': 'This course does not exist' });
        }
      }).catch(function (err) {
        res.send(500);
      });
  });
});

module.exports = router;