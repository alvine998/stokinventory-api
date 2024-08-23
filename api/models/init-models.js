var DataTypes = require("sequelize").DataTypes;
var _deliveries = require("./deliveries");

function initModels(sequelize) {
  var deliveries = _deliveries(sequelize, DataTypes);


  return {
    deliveries,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
