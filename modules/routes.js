const express = require('express');
const router = express.Router();

require('./auth/AuthRoute')(router);
require('./user/UserRoute')(router);
require('./deposit/DepositRoute')(router);
require('./withdrawal/WithdrawalRoute')(router);
require('./transaction/TransactionRoute')(router);
require('./investment/InvestmentRoute')(router);
require('./affiliate/AffiliateRoute')(router);
require('./customer_support/CustomerSupportRoute')(router);

require('../services/email/EmailRoute')(router);


module.exports = router;
