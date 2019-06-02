'use strict';

const express = require('express');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { sequelize, models } = require('./db');
const Sequelize = require('sequelize');
const { User, Course } = models;
const router = express.Router();


sequelize
  .authenticate()
  .then(() => {
    console.log('Synchronizing the models with the database...');

    return sequelize.sync();
  })
const authenticateUser = (req, res, next) => {
  const credentials = auth(req);
  if (credentials) {
    const user = User.findOne({
      where: {
        emailAddress: credentials.name
      }
    })
      .then(function (user) {
        if (!user) {
          res.status(404).json({ message: 'Invalid Username' });
        }
        else {
          bcryptjs.compare(credentials.pass, user.password, function (err, result) {
            if (result == true) {
              console.log(`Authentication successful for username: ${user.emailAddress}`);
              next();
            } else {
              res.status(401).json({ message: 'Access Denied - Wrong Password TRY AGAIN' });
            }
          });
        }
      });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
};

router.get('/users', authenticateUser, (req, res) => {
  const credentials = auth(req);
  User.findOne({
    where: {
      emailAddress: credentials.name
    }
  }).then(async function (user) {
    console.log(credentials.name)
    if (!user) {
      return res.sendStatus(400);
    } else {
      return res.json({ 'User': user.firstName, 'Last Name': user.lastName, 'Email': user.emailAddress });
    }
  });
});

router.get('/courses', (req, res) => {
  Course.findAll({
    order: [["id", "ASC"]],
    attributes: {
      exclude: ['userId']
    },
    include: [
      {
        model: User,
        as: 'creator',
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

router.get('/courses/:id', (req, res) => {
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
        as: 'creator',
        attributes: {
          exclude: ['id', 'password']
        }
      }
    ]
  }).then(function (courses) {
    console.log(courses)
    if (!courses.length) {
      return res.json({'Error' : 'No Course Found With This Id'});
    } else {
    return res.json(courses)
    }
  }).catch(function (err) {
    res.send(500);
  });
});

router.post('/users', function (req, res) {
  User.create(req.body).then(function (user) {
    console.log(user)
    return res.status(201).end();
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

router.post('/courses', authenticateUser, function (req, res) {
  const credentials = auth(req);
  User.findOne({
    where: {
      emailAddress: credentials.name
    }
  }).then(async function (user) {
    if (!user) {
      return res.status(401).json({ message: 'Access Denied - Not Logged in' }).end();
    }
    else {
      Course.create({
        title: req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        materialsNeeded: req.body.materialsNeeded,
        userId: user.id
      }).then(function (course) {
        console.log(course)
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
    }
  });
});
router.put('/courses/:id', authenticateUser, function (req, res) {
  const credentials = auth(req);
  User.findOne({
    where: {
      emailAddress: credentials.name
    }
  }).then(async function (user) {
    if (!user) {
      return res.status(401).json({ message: 'Access Denied - Not Logged in' }).end();
    }
    else {
      Course.findByPk(req.params.id).then(function (course) {
       if (!req.body.title || !req.body.description) {
        return res.status(400).json({ 'Error':'Title and Description are required' }).end()
       }
      if (course) { 
        course.update({
          title: req.body.title,
          description: req.body.description,
          estimatedTime: req.body.estimatedTime,
          materialsNeeded: req.body.materialsNeeded,
          userId: user.id
        }).then(function (course) {
          console.log(course)
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
  } 
});
});
router.delete("/courses/:id", authenticateUser, function (req, res, next) {
  const credentials = auth(req);
  User.findOne({
    where: {
      emailAddress: credentials.name
    }
  }).then(async function (user) {
    if (!user) {
      return res.status(401).json({ message: 'Access Denied - Not Logged in' }).end();
    }
    else {
      Course.findByPk(req.params.id).then(function (course) {
        if (course) {
          return course.destroy().then(function (course) {
            return res.status(201).end();
          });  
        } else {
          res.send(404);
        }
      }).catch(function (err) {
        res.send(500);
      });
    }
  });
});

module.exports = router;
