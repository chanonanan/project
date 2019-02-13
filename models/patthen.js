'use strict';
module.exports = (sequelize, DataTypes) => {
  const Patthen = sequelize.define('Patthen', {
    patthen_name: DataTypes.STRING,
    patthen: DataTypes.STRING,
    length: DataTypes.INTEGER
  }, {});
  Patthen.associate = function(models) {
    // associations can be defined here
    Patthen.belongsTo(models.User, {foreignKey: 'created_by'});
  };
  return Patthen;
};