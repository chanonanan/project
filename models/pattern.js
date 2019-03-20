'use strict';
module.exports = (sequelize, DataTypes) => {
  const Pattern = sequelize.define('Pattern', {
    pattern_name: DataTypes.STRING,
    pattern: DataTypes.STRING,
    length: DataTypes.INTEGER
  }, {});
  Pattern.associate = function(models) {
    // associations can be defined here
    Pattern.belongsTo(models.User, {foreignKey: 'created_by'});
  };
  return Pattern;
};