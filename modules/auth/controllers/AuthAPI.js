
//Classes
const Auth = require("./Auth");


exports.login = async (req, res) => {
    try {
        const errors = {};
        const body = req.body;

        const auth = new Auth(body);
        const login_user = await auth.login();

        return res.json(login_user);

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'There was an error, please try again!',
            error: {},
            token: null
        });
    }
}

exports.register = async (req, res) => {
    try {
        const errors = {};
        const body = req.body;

        const auth = new Auth(body);
        const login_user = await auth.register();

        return res.json(login_user);

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'There was an error, please try again!',
            error: {},
            token: null
        });
    }
}

exports.addAdmin = async (req, res) => {
    try {
        const errors = {};
        const body = req.body;
        const auth = new Auth();

        body.password = auth.generateStrongPassword(8)
        const login_user = await auth.addAdmin(body);

        return res.json({
            success: login_user.success,
            errors: login_user.errors,
            message: login_user.message,
            data: {
                password: body.password,
                email: body.email,
            },
        });
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'There was an error, please try again!',
            error: {},
            token: null
        });
    }
}

exports.changePassword = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;

        const auth = new Auth({
            ...body,
            ...user,
        });

        const change_password = await auth.changePassword();

        return res.json(change_password);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'There was an error, please try again!',
            error: {},
        });
    }
}

exports.sendResetPasswordCode = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;

        body.username = body.email;
        const auth = new Auth(body);

        const send_email = await auth.sendResetPasswordCode();

        return res.json(send_email);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'There was an error, please try again!',
            error: {},
        });
    }
}

exports.verifyPasswordResetCode = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;

        body.username = body.email;
        body.user = user;

        const auth = new Auth(body);

        const verify_code = await auth.verifyPasswordResetCode();

        return res.json(verify_code);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'There was an error, please try again!',
            error: {},
        });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;
        body.user = user;

        body.username = body.email;
        const auth = new Auth(body);

        const reset = await auth.resetPassword();

        return res.json(reset);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'There was an error, please try again!',
            error: {},
        });
    }
}

exports.sendEmailVerificationCode = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;

        body.username = user.username;
        body.slug = user.slug;
        body.email = user.email;
        body._id = user._id;
        const auth = new Auth(body);

        const send_email = await auth.sendEmailVerificationCode();

        return res.json(send_email);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'There was an error, please try again!',
            error: {},
        });
    }
}

exports.confirmEmail = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;

        body.username = body.email;
        const auth = new Auth(body);

        const confirm = await auth.confirmEmail();

        return res.json(confirm);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'There was an error, please try again!',
            error: {},
        });
    }
}

exports.verifyAuthToken = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;

        const auth = new Auth(body);

        const verify = await auth.verifyAuthToken();

        return res.json(verify);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'Something went wrong. Please try again later.',
            error: {},
        });
    }
}

exports.requestTwoFactorAuth = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;
        body.user = user

        const auth = new Auth(body);

        const request = await auth.requestTwoFactorAuth();

        return res.json(request);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'Something went wrong. Please try again later.',
            error: {},
        });
    }
}

exports.enableTwoFactorAuth = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;
        body.user = user

        const auth = new Auth(body);

        const enable = await auth.enableTwoFactorAuth();

        return res.json(enable);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'Something went wrong. Please try again later.',
            error: {},
        });
    }
}

exports.verifyTwoFactorAuth = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;
        body.user = user

        const auth = new Auth(body);

        const verify = await auth.verifyTwoFactorAuth();

        return res.json(verify);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'Something went wrong. Please try again later.',
            error: {},
        });
    }
}

exports.disableTwoFactorAuth = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;
        body.user = user

        const auth = new Auth(body);

        const disable = await auth.disableTwoFactorAuth();

        return res.json(disable);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'Something went wrong. Please try again later.',
            error: {},
        });
    }
}

exports.seedAuthRoles = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;
        body.user = user

        const auth = new Auth(body);
        await auth.seedAuthRoles();

        return res.json({
            success: true,
            message: 'Roles seeded',
        });
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'Something went wrong. Please try again later.',
            error: {},
        });
    }
}

exports.setAuthRole = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;

        const auth = new Auth();
        const result = await auth.setAuthRole(body);
        return res.json(result);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'Something went wrong. Please try again later.',
            error: {},
        });
    }
}

exports.TEST = async (req, res) => {
    try {
        let errors = {};
        let body = req.body;
        let user = req.authUser;
        //body.user = user

        const auth = new Auth(body);

        const result = await auth.authorize([], user);

        return res.json({
            success: true,
            message: 'Test successful',
            data: result,
            user: user,
        });
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'Something went wrong. Please try again later.',
            error: {},
        });
    }
}