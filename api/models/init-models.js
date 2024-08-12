var DataTypes = require("sequelize").DataTypes;
var _deliveries = require("./deliveries");
var _partners = require("./partners");
var _products = require("./products");
var _purchases = require("./purchases");
var _recipes = require("./recipes");
var _stocks = require("./stocks");
var _stores = require("./stores");
var _suppliers = require("./suppliers");
var _users = require("./users");

function initModels(sequelize) {
  var deliveries = _deliveries(sequelize, DataTypes);
  var partners = _partners(sequelize, DataTypes);
  var products = _products(sequelize, DataTypes);
  var purchases = _purchases(sequelize, DataTypes);
  var recipes = _recipes(sequelize, DataTypes);
  var stocks = _stocks(sequelize, DataTypes);
  var stores = _stores(sequelize, DataTypes);
  var suppliers = _suppliers(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);


  return {
    deliveries,
    partners,
    products,
    purchases,
    recipes,
    stocks,
    stores,
    suppliers,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
