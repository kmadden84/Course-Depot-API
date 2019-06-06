const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { sequelize, models } = require('../db');
const { User, Course } = models;


authenticateUser = (req, res, next) => {
  const credentials = auth(req);
  if (credentials) {
    User.findOne({
      where: {
        emailAddress: credentials.name
      }
    })
      .then(function (user) {
        if (!user) {
          res.status(401).json({ Error: 'You must be logged in to post data' });
        }
        else {
          bcryptjs.compare(credentials.pass, user.password, function (err, result) {
            if (result == true) {
              res.status(200);
              console.log(`Authentication successful for username: ${user.emailAddress}`);
              next();
            } else {
              res.status(401).json({ Error: 'Access Denied - Wrong Password TRY AGAIN' });
            }
          });
        }
      });
  } else {
    res.status(401).json({ Error: 'Not logged in' });
  }
}

module.exports = {
  authenticateUser : authenticateUser
}
