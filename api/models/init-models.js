var DataTypes = require("sequelize").DataTypes;
var _deliveries = require("./deliveries");
var _partners = require("./partners");
var _products = require("./products");
var _purchases = require("./purchases");
var _stocks = require("./stocks");
var _stores = require("./stores");
var _users = require("./users");

function initModels(sequelize) {
  var deliveries = _deliveries(sequelize, DataTypes);
  var partners = _partners(sequelize, DataTypes);
  var products = _products(sequelize, DataTypes);
  var purchases = _purchases(sequelize, DataTypes);
  var stocks = _stocks(sequelize, DataTypes);
  var stores = _stores(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  stocks.belongsTo(products, { as: "product", foreignKey: "product_id"});
  products.hasMany(stocks, { as: "stocks", foreignKey: "product_id"});
  stocks.belongsTo(stores, { as: "store", foreignKey: "store_id"});
  stores.hasMany(stocks, { as: "stocks", foreignKey: "store_id"});
  users.belongsTo(stores, { as: "store", foreignKey: "store_id"});
  stores.hasMany(users, { as: "users", foreignKey: "store_id"});

  return {
    deliveries,
    partners,
    products,
    purchases,
    stocks,
    stores,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
