const { middlewareHere, middlewarePartnerCode } = require('../middleware/index.js');

module.exports = (app) => {
    const cProduct = require('../controllers/product.js');
    const cUser = require('../controllers/user.js');
    const cStore = require('../controllers/store.js');
    const cPartner = require('../controllers/partner.js');
    const cStock = require('../controllers/stock.js');
    
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

    app.get('/stocks', middlewareHere, middlewarePartnerCode, cStock.list);
    app.post('/stock', middlewareHere, middlewarePartnerCode, cStock.create);
    app.delete('/stock', middlewareHere, middlewarePartnerCode, cStock.delete);
}