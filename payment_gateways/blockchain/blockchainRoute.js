/**
 * Controller to handle user operations
 */
'use strict';



const bitcoin = require('./bitcoin/bitcoin_controller');
const USDT_TRC20 = require('./tron/USDT_TRC20_controller');
const eth = require('./ethereum/eth_controller');


module.exports = function (router) {
    router.post('/api/blockchain/usdt/test', USDT_TRC20.test);
    router.post('/api/blockchain/bitcoin/test', bitcoin.test);
    router.post('/api/blockchain/eth/test', eth.test);
};
