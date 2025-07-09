
const Service = require("./Service");

exports.getService = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const service = new Service(authUser);
        const getService = await service.getService(query)

        if(getService){
            return res.json({
                success: true,
                ...getService,
                response: 'Service Found',
                message: 'Service data retrieved successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Service Not Found',
                message: 'No service found with the provided information.'
            });
        }
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

exports.getServices = async (req, res) => {
    try {
        const query = req.query;
        let authUser = req.authUser;

        const service = new Service(query);
        const getServices = await service.getServices(query)
        return res.json(getServices);
    } catch (e) {
        return res.json([]);
    }
}

exports.createService = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const service = new Service();
        const result = await service.create(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Service Found',
                message: 'Service Created successfully.'
            });
        } else {
            return res.json(result);
        }

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

exports.updateService = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const service = new Service();
        const result = await service.update(body)

        if(result){
            return res.json({
                success: true,
                response: 'Service Found',
                message: 'Service updated successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error updating the service, please try again'
            });
        }

    } catch (e) {
        //console.log(e)
        return res.json({
            success: false,
            response: e.message || 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

exports.deleteService = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const service = new Service();
        const result = await service.delete(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Service Found',
                message: 'Service delete successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error deleting the service, please try again',
                ...result,
            });
        }

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}


// get service types
exports.getServiceType = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const service = new Service(authUser);
        const getServiceType = await service.getServiceType(query)

        if(getServiceType){
            return res.json({
                success: true,
                ...getServiceType,
                response: 'Service Type Found',
                message: 'Service type data retrieved successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Service Type Not Found',
                message: 'No service type found with the provided information.'
            });
        }
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

// get service types
exports.getServiceTypes = async (req, res) => {
    try {
        const query = req.query;
        let authUser = req.authUser;

        const service = new Service(query);
        const getServiceTypes = await service.getServiceTypes(query)
        return res.json(getServiceTypes);
    } catch (e) {
        return res.json([]);
    }
}

// create service type
exports.createServiceType = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const service = new Service();
        const result = await service.createServiceType(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Service Type Found',
                message: 'Service Type Created successfully.'
            });
        } else {
            return res.json(result);
        }

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

// update service type
exports.updateServiceType = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const service = new Service();
        const result = await service.updateServiceType(body)

        if(result){
            return res.json({
                success: true,
                response: 'Service Type Found',
                message: 'Service Type updated successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error updating the service type, please try again'
            });
        }

    } catch (e) {
        //console.log(e)
        return res.json({
            success: false,
            response: e.message || 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

// delete service type
exports.deleteServiceType = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const service = new Service();
        const result = await service.deleteServiceType(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Service Type Found',
                message: 'Service Type delete successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error deleting the service type, please try again',
                ...result,
            });
        }

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}