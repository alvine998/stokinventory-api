const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('deliveries', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    partner_code: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    stocks: {
      type: DataTypes.JSON,
      allowNull: false
    },
    deliver_at: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    arrived_at: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    image_arrived: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_deliver: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    delivered_by: {
      type: DataTypes.JSON,
      allowNull: false
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_on: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'deliveries',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
