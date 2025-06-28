const rateLimit = require('express-rate-limit');
const config = require('../../lib/config');


const login_limiter = rateLimit({
    windowMs: config.login_rate_limit_time,
    limit: config.login_rate_limit,
    message: async (req, res) => {
        return res.json({
            success: false,
            message: `Too many login attempts from this devices, please try again after 15 minutes`,
            response: `Too many login attempts from this devices, please try again after 15 minutes`,
            error: null,
            token: null
        })
    },
});


module.exports = login_limiter;
