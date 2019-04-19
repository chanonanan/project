'use strict';
module.exports = (sequelize, DataTypes) => {
  const Test = sequelize.define('Test', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    test_name: DataTypes.STRING,
    style: DataTypes.INTEGER,
    date: DataTypes.DATE,
  }, {});
  Test.associate = function(models) {
    // associations can be defined here
    Test.belongsTo(models.User, {foreignKey: 'athlete_id', as: 'Athlete'});
    Test.belongsTo(models.User, {foreignKey: 'coach_id', as: 'Coach'});
    Test.belongsTo(models.Pattern, {foreignKey: 'pattern_id', as: 'Pattern'});
    Test.hasMany(models.Record, {foreignKey: 'test_id'});
  };
  return Test;
};