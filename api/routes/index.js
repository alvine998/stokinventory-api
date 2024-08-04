const { middlewareHere } = require('../middleware/index.js');

module.exports = (app) => {
    const cProduct = require('../controllers/product.js');
    const cUser = require('../controllers/user.js');
    const cStore = require('../controllers/store.js');
    const cPartner = require('../controllers/partner.js');
    const cStock = require('../controllers/stock.js');

    app.get('/products', middlewareHere, cProduct.list);
    app.post('/product', middlewareHere, cProduct.create);
    app.patch('/product', middlewareHere, cProduct.update);
    app.delete('/product', middlewareHere, cProduct.delete);

    app.get('/users', middlewareHere, cUser.list);
    app.post('/user', middlewareHere, cUser.create);
    app.patch('/user', middlewareHere, cUser.update);
    app.delete('/user', middlewareHere, cUser.delete);
    app.post('/user/auth', middlewareHere, cUser.login);

    app.get('/stores', middlewareHere, cStore.list);
    app.post('/store', middlewareHere, cStore.create);
    app.patch('/store', middlewareHere, cStore.update);
    app.delete('/store', middlewareHere, cStore.delete);

    app.get('/partners', middlewareHere, cPartner.list);
    app.post('/partner', middlewareHere, cPartner.create);
    app.patch('/partner', middlewareHere, cPartner.update);
    app.delete('/partner', middlewareHere, cPartner.delete);

    app.get('/stocks', middlewareHere, cStock.list);
    app.post('/stock', middlewareHere, cStock.create);
    app.patch('/stock', middlewareHere, cStock.update);
    app.delete('/stock', middlewareHere, cStock.delete);
}