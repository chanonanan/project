'use strict';
module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('Record', {
    timestamp: DataTypes.DATE
  }, {});
  Record.associate = function(models) {
    // associations can be defined here
    Record.belongsTo(models.Test, {foreignKey: 'test_id'});
  };
  return Record;
};