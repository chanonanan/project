'use strict';
module.exports = (sequelize, DataTypes) => {
  const Test = sequelize.define('Test', {
    test_name: DataTypes.STRING,
    date: DataTypes.DATE,
  }, {});
  Test.associate = function(models) {
    // associations can be defined here
    Test.belongsTo(models.User, {foreignKey: 'player_id'});
    Test.belongsTo(models.User, {foreignKey: 'coach_id'});
    Test.belongsTo(models.Patthen, {foreignKey: 'patthen_id'});
  };
  return Test;
};