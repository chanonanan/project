'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role_id: DataTypes.INTEGER,
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Pattern, {foreignKey: 'created_by'});
    User.hasMany(models.Test, {foreignKey: 'athlete_id', as: 'Athlete'});
    User.hasMany(models.Test, {foreignKey: 'coach_id', as: 'Coach'});
  };
  return User;
};