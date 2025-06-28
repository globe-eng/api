
// Authentications
const authenticate = require('../../middleware/authenticate');

const support = require('./controllers/CustomerSupportApi');


module.exports = function (router) {
    router.post('/api/customer-support/create-support-ticket', authenticate, support.createSupportTicket);
    router.get('/api/customer-support/get-support-ticket', authenticate, support.getSupportTicket);
    router.get('/api/customer-support/get-support-tickets-user', authenticate, support.getSupportTicketsUser);
    router.get('/api/customer-support/get-support-tickets-admin', authenticate, support.getSupportTicketsAdmin);
    router.post('/api/customer-support/send-message', authenticate, support.sendMessage);
    router.get('/api/customer-support/get-messages', authenticate, support.getMessages);
    router.post('/api/customer-support/read-messages', authenticate, support.readMessages);
};


