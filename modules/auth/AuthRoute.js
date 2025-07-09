
/***********************************************************
 *               Authentication Api                       *
 * ********************************************************/
const authenticate = require('../../middleware/authenticate');
const login_limiter = require('../../middleware/rate_limits/login_limiter');
const auth = require('./controllers/AuthAPI');

module.exports = function (router) {
    router.post('/api/auth/seed-auth-roles', authenticate, auth.seedAuthRoles);
    router.post('/api/auth/set-auth-role', authenticate, auth.setAuthRole);
    router.post('/api/auth/login',  auth.login);
    //router.post('/api/auth/logout', authApi.logout);
    router.post('/api/auth/register', auth.register);
    router.post('/api/auth/change-password', authenticate, auth.changePassword);

    router.post('/api/auth/send-reset-password-code', auth.sendResetPasswordCode);
    router.post('/api/auth/verify-password-reset-code',  auth.verifyPasswordResetCode);
    router.post('/api/auth/reset-password', authenticate, auth.resetPassword);

    router.post('/api/auth/send-email-verification-code', authenticate, auth.sendEmailVerificationCode);
    router.post('/api/auth/confirm-email', authenticate, auth.confirmEmail);
    router.post('/api/auth/verify-auth-token', auth.verifyAuthToken);

    router.post('/api/auth/2fa/request', authenticate, auth.requestTwoFactorAuth);
    router.post('/api/auth/2fa/enable', authenticate, auth.enableTwoFactorAuth);
    router.post('/api/auth/2fa/verify', authenticate, auth.verifyTwoFactorAuth);
    router.post('/api/auth/2fa/disable', authenticate, auth.disableTwoFactorAuth);

    router.post('/api/auth/add-admin', authenticate, auth.addAdmin);

    router.post('/api/auth/test', authenticate, auth.TEST);
};

