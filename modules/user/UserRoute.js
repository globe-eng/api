/**
 * Controller to handle user operations
 */
'use strict';

// Authentications
const authenticate = require('../../middleware/authenticate');

const user = require('./controllers/UserApi');


module.exports = function (router) {

    //User
    router.get('/api/users', authenticate, user.getUsers);
    router.get('/api/users/user', authenticate, user.getUser);
    router.put('/api/users/user', authenticate, user.updateUser);
   // router.post('/api/users/test', authenticate, user.test);
    router.post('/api/users/test', user.test);

    //Admin


};


