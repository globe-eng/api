'use strict';

const authenticate = require('../../middleware/authenticate');
const service = require('./controllers/ServiceApi');


module.exports = function (router) {
    router.post('/api/service/create-service', authenticate, service.createService);
    router.put('/api/service/update-service', authenticate, service.updateService);
    router.delete('/api/service/delete-service', authenticate, service.deleteService);
    router.get('/api/service/get-service', service.getService);
    router.get('/api/service/get-services', service.getServices);

    router.get('/api/service/get-service-types', service.getServiceTypes);
    router.get('/api/service/get-service-type', service.getServiceType);
    router.post('/api/service/create-service-type', authenticate, service.createServiceType);
    router.put('/api/service/update-service-type', authenticate, service.updateServiceType);
    router.delete('/api/service/delete-service-type', authenticate, service.deleteServiceType);
};



