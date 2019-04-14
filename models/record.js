'use strict';
module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('Record', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      validate: {
        notNull: true
      }
    },
    duration: DataTypes.INTEGER,
    from: DataTypes.STRING,
    to: DataTypes.STRING
  }, {});
  Record.associate = function(models) {
    // associations can be defined here
    Record.belongsTo(models.Test, {foreignKey: 'test_id'});
  };
  return Record;
};