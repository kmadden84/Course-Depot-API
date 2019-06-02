'use strict';

const bcryptjs = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter your first ame'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter your last name'
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail : {
          args: true,
          msg: "Must enter a valid email"
        },
        notNull: {
          msg: 'Please enter email'
        },
        isUnique: function (value, next) {
          var self = this;
          User.findOne({ where: { emailAddress: value } })
            .then(function (user) {
              // reject if a different user wants to use the same email
              if (user && self.id !== user.id) {
                return next('Email already in use!');
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter your password'
        }
      }
    },
  }, {
      hooks: {
        beforeCreate: async function (user) {
          const salt = await bcryptjs.genSalt(10); 
          user.password = await bcryptjs.hash(user.password, salt);
        }
      },
      instanceMethods: {
        validPassword: function (password) {
          return bcryptjs.compareSync(password, this.password);
        }
      }
    });
  User.associate = function (models) {
    User.hasMany(models.Course, {
      as: 'creator',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false
      },
    });
  };
  sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

  return User;
};