'use strict';
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Please enter a title'
        },
        notEmpty: {
          args: true,
          msg: "description cannot be empty"
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Please enter a description'
        },
        notEmpty: {
          args: true,
          msg: "description cannot be empty"
        }
      }
    },
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    materialsNeeded: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });
  Course.associate = function(models) {
    Course.belongsTo(models.User, {
      as: 'creator',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };
  return Course;
};