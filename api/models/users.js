const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
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
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    store_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    store_code: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(13),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM('L','P'),
      allowNull: false,
      defaultValue: "L"
    },
    password: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    photo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin_store','admin_warehouse','super_admin'),
      allowNull: false
    },
    is_stokinv_admin: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
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
    tableName: 'users',
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
