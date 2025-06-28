

const Email = require("./Email")

exports.design = async (req, res) => {
    try {
        const welcome = {
            type: 'welcome',
            user: 'John Doe',
            email: 'rexfloki001@gmail.com',
            code: 455467,
            subject: 'Welcome John Doe',
            test: true
        }

        const email = new Email();

        const content = await email.sendWelcomeEmail(welcome)
        res.send(content);
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'There was an error, please try again!',
            error: e,
        });
    }
}



exports.test_email = async (req, res) => {
    try {

        const welcome = {
            type: 'welcome',
            user: 'John Doe',
            email: 'rexfloki001@gmail.com',
            code: 455467,
            subject: 'Welcome John Doe',
        }

        const email = new Email();
        const result = await email.sendWelcomeEmail(welcome)


        return res.json({
            success: result,
            message: result? 'Email Sent': "Email Not Sent",
            error: null,
        });
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            message: 'There was an error, please try again!',
            error: e,
        });
    }
}

