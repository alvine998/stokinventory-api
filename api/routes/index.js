const { middlewareHere, middlewarePartnerCode } = require('../middleware/index.js');

module.exports = (app) => {
    const cProduct = require('../controllers/product.js');
    const cUser = require('../controllers/user.js');
    const cStore = require('../controllers/store.js');
    const cPartner = require('../controllers/partner.js');
    const cStock = require('../controllers/stock.js');
    const cRecipe = require('../controllers/recipe.js');
    const cSupplier = require('../controllers/supplier.js');
    const cPurchase = require('../controllers/purchase.js');
    const cDelivery = require('../controllers/delivery.js');
    const cDailyReport = require('../controllers/report/daily.js');

    app.get('/partners', middlewareHere, cPartner.list);
    app.post('/partner', middlewareHere, cPartner.create);
    app.patch('/partner', middlewareHere, cPartner.update);
    app.delete('/partner', middlewareHere, cPartner.delete);

    app.get('/products', middlewareHere, middlewarePartnerCode, cProduct.list);
    app.post('/product', middlewareHere, middlewarePartnerCode, cProduct.create);
    app.patch('/product', middlewareHere, middlewarePartnerCode, cProduct.update);
    app.delete('/product', middlewareHere, middlewarePartnerCode, cProduct.delete);

    app.get('/users', middlewareHere, middlewarePartnerCode, cUser.list);
    app.post('/user', middlewareHere, middlewarePartnerCode, cUser.create);
    app.patch('/user', middlewareHere, middlewarePartnerCode, cUser.update);
    app.delete('/user', middlewareHere, middlewarePartnerCode, cUser.delete);
    app.post('/user/auth', middlewareHere, cUser.login);

    app.get('/stores', middlewareHere, middlewarePartnerCode, cStore.list);
    app.post('/store', middlewareHere, middlewarePartnerCode, cStore.create);
    app.patch('/store', middlewareHere, middlewarePartnerCode, cStore.update);
    app.delete('/store', middlewareHere, middlewarePartnerCode, cStore.delete);

    app.get('/recipes', middlewareHere, middlewarePartnerCode, cRecipe.list);
    app.post('/recipe', middlewareHere, middlewarePartnerCode, cRecipe.create);
    app.patch('/recipe', middlewareHere, middlewarePartnerCode, cRecipe.update);
    app.delete('/recipe', middlewareHere, middlewarePartnerCode, cRecipe.delete);

    app.get('/suppliers', middlewareHere, middlewarePartnerCode, cSupplier.list);
    app.post('/supplier', middlewareHere, middlewarePartnerCode, cSupplier.create);
    app.patch('/supplier', middlewareHere, middlewarePartnerCode, cSupplier.update);
    app.delete('/supplier', middlewareHere, middlewarePartnerCode, cSupplier.delete);

    app.get('/purchases', middlewareHere, middlewarePartnerCode, cPurchase.list);
    app.post('/purchase', middlewareHere, middlewarePartnerCode, cPurchase.create);
    app.patch('/purchase', middlewareHere, middlewarePartnerCode, cPurchase.update);
    app.delete('/purchase', middlewareHere, middlewarePartnerCode, cPurchase.delete);

    app.get('/deliveries', middlewareHere, middlewarePartnerCode, cDelivery.list);
    app.post('/delivery', middlewareHere, middlewarePartnerCode, cDelivery.create);
    app.patch('/delivery', middlewareHere, middlewarePartnerCode, cDelivery.update);
    app.delete('/delivery', middlewareHere, middlewarePartnerCode, cDelivery.delete);

    app.get('/stocks', middlewareHere, middlewarePartnerCode, cStock.list);
    app.post('/stock', middlewareHere, middlewarePartnerCode, cStock.create);
    app.patch('/stock', middlewareHere, middlewarePartnerCode, cStock.delete);

    app.get('/daily/reports', middlewareHere, middlewarePartnerCode, cDailyReport.list);
    app.post('/daily/report', middlewareHere, middlewarePartnerCode, cDailyReport.create);
    app.patch('/daily/report', middlewareHere, middlewarePartnerCode, cDailyReport.update);
    app.delete('/daily/report', middlewareHere, middlewarePartnerCode, cDailyReport.delete);
}