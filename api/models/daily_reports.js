const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('daily_reports', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    partner_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    trx_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    store_name: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    products: {
      type: DataTypes.JSON,
      allowNull: false
    },
    total_product: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    total_price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    reported_by: {
      type: DataTypes.JSON,
      allowNull: false
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
    tableName: 'daily_reports',
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
      {
        name: "partner_code",
        using: "BTREE",
        fields: [
          { name: "partner_code" },
        ]
      },
      {
        name: "store_id",
        using: "BTREE",
        fields: [
          { name: "store_id" },
        ]
      },
      {
        name: "store_name",
        using: "BTREE",
        fields: [
          { name: "store_name" },
        ]
      },
    ]
  });
};
