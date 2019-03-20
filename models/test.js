'use strict';
module.exports = (sequelize, DataTypes) => {
  const Test = sequelize.define('Test', {
    test_name: DataTypes.STRING,
    date: DataTypes.DATE,
  }, {});
  Test.associate = function(models) {
    // associations can be defined here
    Test.belongsTo(models.User, {foreignKey: 'player_id', as: 'Player'});
    Test.belongsTo(models.User, {foreignKey: 'coach_id', as: 'Coach'});
    Test.belongsTo(models.Pattern, {foreignKey: 'pattern_id', as: 'Pattern'});
  };
  return Test;
};