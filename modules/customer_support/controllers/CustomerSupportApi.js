
const Support = require("./CustomerSupport");


exports.getSupportTicket = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const support = new Support();
        const getSupport = await support.getSupportTicket(query);

        return res.json(getSupport);
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            response: 'An Error Occurred',
            message: 'There was an error retrieving Support Ticket'
        });
    }
}

exports.getSupportTicketsUser = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        query.user = authUser.slug;
        const support = new Support();
        const getSupport = await support.getSupportTickets(query);

        return res.json(getSupport);
    } catch (error) {
        console.log(error);
        return res.json([]);
    }
}

exports.getSupportTicketsAdmin = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const support = new Support();
        const getSupport = await support.getSupportTickets(query);

        return res.json(getSupport);
    } catch (error) {
        console.log(error);
        return res.json([]);
    }
}

exports.createSupportTicket = async (req, res) => {
    try {
        const errors = {};
        const files = req.files;
        const body = req.body;
        let authUser = req.authUser;

        const support = new Support();
        const createSupport = await support.createSupportTicket({
            user: authUser.slug,
            ...body
        });

        return res.json(createSupport);
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            error: error,
            response: 'An Error Occurred',
            message: 'There was an error creating Support Ticket',
        });
    }
}

exports.sendMessage = async (req, res) => {
    try {
        const errors = {};
        const files = req.files;
        const body = req.body;
        let authUser = req.authUser;

        const support = new Support();
        const createSupport = await support.sendMessage({
            files: files,
            ...body
        });

        return res.json(createSupport);
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            error: error,
            response: 'An Error Occurred',
            message: 'There was an error creating Support Ticket',
        });
    }
}

exports.getMessages = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const support = new Support();
        const getMessages = await support.getSupportTicketMessages(query);

        return res.json(getMessages);
    } catch (error) {
        console.log(error);
        return res.json([]);
    }
}

exports.readMessages = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const support = new Support();
        const readMessages = await support.readMessages(body);

        return res.json(readMessages);
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            response: 'An Error Occurred',
            message: 'There was an error reading messages'
        });
    }
}