/**
 * Controller to handle user operations
 */
'use strict';
const email = require('./EmailAPI');

module.exports = function (router) {
    router.get('/api/email/design', email.design);
    router.post('/api/email', email.test_email);
};
