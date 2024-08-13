const dbConfig = require("../../config/db.config.js");
const mysql2 = require("mysql2")

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  dialectModule: mysql2,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  dialectOptions: {
    connectTimeout: 60000 // Increase connection timeout in ms
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./users.js")(sequelize, Sequelize);
db.products = require("./products.js")(sequelize, Sequelize);
db.partners = require("./partners.js")(sequelize, Sequelize);
db.stores = require("./stores.js")(sequelize, Sequelize);
db.stocks = require("./stocks.js")(sequelize, Sequelize);
db.recipes = require("./recipes.js")(sequelize, Sequelize);
db.suppliers = require("./suppliers.js")(sequelize, Sequelize);
db.deliveries = require("./deliveries.js")(sequelize, Sequelize);
db.purchases = require("./purchases.js")(sequelize, Sequelize);

module.exports = db;