const jwt = require('jsonwebtoken');
const _ = require('lodash');
const jwtDecode = require('jwt-decode');
const validator = require("email-validator");
const escape = require('escape-html');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const {authenticator} = require('otplib');
const Notifications = require("../../notification/controllers/Notifications");
const AuthRolesModel = require("../models/authRolesModel");

const config = require('../../../lib/config');
const utils = require('../../../utils');

//Class
const User = require("../../user/controllers/User")
const Utils = require("../../../lib/Utils");



class Auth extends User {

    constructor(props = {}) {
        super(props);
        this.props = props;
    }

    async seedAuthRoles(){
        const roles = [
            {
                name: 'user',
                permissions: []
            },
            {
                name: 'admin',
                permissions: ['user:read', 'user:delete', 'admin:dashboard']
            },
            {
                name: 'superadmin',
                permissions: ['*']
            }
        ];

        for (let role of roles) {
            await AuthRolesModel.updateOne({ name: role.name }, role, { upsert: true });
        }
        console.log('Roles seeded');
    }

    async setAuthRole(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.user)) {
                errors.user = 'Email, ID, or username is required';
            }

            if (Utils.isEmpty(data.role)) {
                errors.role = 'Role is required';
            } else {
                data.role = data.role.toLowerCase();
                const validRoles = ['user', 'admin', 'superadmin'];
                if (!validRoles.includes(data.role)) {
                    errors.role = `Role must be one of: ${validRoles.join(', ')}`;
                }
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            let getUser = await this.userData({
                slug: data.user,
                _id: data.user,
                email: data.user,
                username: data.user,
            });

            if (!getUser) {
                return {
                    success: false,
                    message: "Account not found.",
                    response: "The provided credentials do not match any existing account."
                }
            }

            getUser = await this.update({
                slug: getUser.slug,
                role: data.role,
            })

            return  {
                success: true,
                errors: {},
                response: 'Role Updated',
            };
        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }

    async authorize(requiredPermissions = [], user = {}) {
        const userPermissions = user?.role?.permissions;
        return  requiredPermissions.every(p =>
            userPermissions.includes(p) || userPermissions.includes('*')
        );
    };

    generateStrongPassword(length = 12) {
        const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const digits = "0123456789";

        // Ensure at least 1 character from each required group
        const getRandom = (chars) => chars[Math.floor(Math.random() * chars.length)];

        let password = [
            getRandom(symbols),      // 1 symbol
            getRandom(uppercase),    // 1 uppercase
            getRandom(digits),       // 1 digit
            getRandom(lowercase)     // ensure some lowercase
        ];

        // Fill the rest with a mix of all allowed characters (excluding spaces)
        const allChars = symbols + uppercase + lowercase + digits;
        while (password.length < length) {
            password.push(getRandom(allChars));
        }

        // Shuffle the password array to make it more random
        password = password.sort(() => Math.random() - 0.5);

        return password.join('');
    }


    //Login
    async login(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.email)) {
                errors.email = 'Email or username is required';
            } else {
                data.username = data.email
            }

            if (Utils.isEmpty(data.password)) {
                errors.password = 'Password is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            const getUser = await this.userData(data);

            if (!getUser) {
                return {
                    success: false,
                    response: "You've entered an invalid email or password. Please try again!",
                    message: "You've entered an invalid email or password. Please try again!",
                }
            }

            if (!await Utils.decryptPassword(data.password, getUser.password)) {
                return {
                    success: false,
                    response: "You've entered an invalid email or password. Please try again!",
                    message: "You've entered an invalid email or password. Please try again!",
                }
            }

           const token = await Utils.createToken(this.getUserPayload(getUser));
            const getUserData = await this.getUser(data);

            return  {
                success: true,
                response: '',
                message: 'Logged in successfully',
                errors: errors,
                token: token,
                data: getUserData,
            };

        } catch (error) {
            return {
                success: false,
                response: "You've entered an invalid email or password. Please try again!",
                message: "You've entered an invalid email or password. Please try again!",
            }
        }
    }

    //Register
    async register(data = this.props) {
        try {
            const errors = {};

            let confirm_email_code = await Utils.createUniqueID(6);
            confirm_email_code = confirm_email_code.toUpperCase();

            data.confirm_email_code = confirm_email_code;

            if(data.ref){
                const ref_user = await this.getUser({slug: data.ref});
                if(ref_user){
                    data.ref_by = ref_user._id;
                }
            }

            const createUser = await this.createUser(data);

            if(!createUser.success){
                return createUser
            }

            const getUser = await this.getUser(createUser);

            const token = await Utils.createToken(this.getUserPayload(createUser));

            /*if(getUser.ref_by){
                Notifications.affiliateNewAffiliatePartner({
                    user: getUser.ref_by,
                    downline_name: `${getUser.first_name} ${getUser.last_name}`,
                }).then(r=>{}).catch(e=>{})
            }*/

           /* Notifications.welcome({
                slug: getUser.slug,
                code: confirm_email_code
            }).then(r=>{}).catch(e=>{})*/

            return  {
                success: true,
                response: '',
                message: 'Registered successfully',
                errors: errors,
                token: token,
                data: getUser,
            };

        } catch (error) {
            console.log("Auth > Register: ", error)
            return {
                success: false,
                response: "There was an error. Please try again!",
                message: "There was an error. Please try again!",
            }
        }
    }

     //Add Admin
    async addAdmin(data = this.props) {
        try {
            const errors = {};

            const createUser = await this.createUser(data);

            if(!createUser.success){
                return createUser
            }

            const getUser = await this.getUser(createUser);

            const token = await Utils.createToken(this.getUserPayload(createUser));

            return  {
                success: true,
                response: '',
                message: 'Admin added successfully',
                errors: errors,
                token: token,
                data: {

                },
            };

        } catch (error) {
            console.log("Auth > AddAdmin: ", error)
            return {
                success: false,
                response: "There was an error. Please try again!",
                message: "There was an error. Please try again!",
            }
        }
    }


    //Logout

    //Change Password
    async changePassword(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.old_password)) {
                errors.old_password = 'old_password is required';
            }

            if (Utils.isEmpty(data.new_password)) {
                errors.new_password = 'New password is required';
            } else if (data.new_password) {
                if (!Utils.isPassword(data.new_password).valid) {
                    errors.new_password = {
                        message: Utils.isPassword(data.new_password).message,
                        requirements: Utils.isPassword(data.new_password).requirements,
                    }
                }
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            const getUser = await this.userData(data);

            if (!getUser) {
                return {
                    success: false,
                    response: "Account Not Found",
                    message: "There was an error. Please try again!",
                }
            }

            // Check old password
            if (!await Utils.decryptPassword(data.old_password, getUser.password)) {
                return {
                    success: false,
                    response: 'Password update failed',
                    message: 'Oops! The old password you entered doesn’t seem to be correct.',
                    errors: {
                        old_password: 'Please double-check your current password and try again.'
                    }
                }
            }

            await this.update({
                slug: getUser.slug,
                password: await Utils.encryptPassword(data.new_password),
            });

            return  {
                success: true,
                response: 'Success',
                message: 'Password successfully changed',
                errors: errors,
                //token: token,
                //data: getUser,
            };

        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }


    //Send reset password email
    async sendResetPasswordCode(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.email)) {
                errors.email = 'Email or username is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            let getUser = await this.userData(data);

            if (!getUser) {
                return {
                    success: false,
                    message: "Account not found. Please verify your email address or username and try again.",
                    response: "The provided credentials do not match any existing account."
                }
            }

            getUser = await this.update({
                slug: getUser.slug,
                reset_password_code: Utils.generate6DigitCode(),
                reset_password_code_expires: Date.now() + 3600000 // 1 hour from now
            })

            const token = await Utils.createResetPasswordToken(this.getUserPayload(getUser))

            await Notifications.resetPasswordCode({
                slug: getUser.slug,
                code: getUser.reset_password_code
            });

            return  {
                success: true,
                errors: {},
                response: 'Message Sent',
                message: 'A password reset code has been sent to your email.',
                token: token
            };

        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }


    //Verify Reset Password Code
    async verifyPasswordResetCode(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.email)) {
                errors.email = 'Email or username is required';
            }

            if (Utils.isEmpty(data.code)) {
                errors.code = 'Code is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }


            const getUser = await this.findOne({
                $or: [{'email': data.email.toLowerCase()}, {'username': data.email.toLowerCase()}],
                reset_password_code: data.code,
                reset_password_code_expires: {$gt: Date.now()}
            });

            if (!getUser) {
                return {
                    success: false,
                    message: "The reset code is invalid or has expired. Please request a new one.",
                    response: "Invalid or expired reset code"
                }
            }


            if (getUser?.slug !== data?.user?.slug) {
                return {
                    success: false,
                    message: "The reset code is invalid or has expired. Please request a new one.",
                    response: "Access Denied"
                }
            }


            //getUser.reset_password_code = null;
            //getUser.reset_password_code_expires = null;
            //await getUser.save();

            return  {
                success: true,
                errors: {},
                response: 'Reset Code Verified',
                message: 'Your password reset code has been verified successfully.'
            };
        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }


    //Reset password
    async resetPassword(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.email)) {
                errors.email = 'Email or username is required';
            }

            if (Utils.isEmpty(data.code)) {
                errors.code = 'Code is required';
            }

            if (Utils.isEmpty(data.password)) {
                errors.password = 'Password is required';
            } else if (data.password) {
                if (!Utils.isPassword(data.password).valid) {
                    errors.password = {
                        message: Utils.isPassword(data.password).message,
                        requirements: Utils.isPassword(data.password).requirements,
                    }
                }
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            const getUser = await this.findOne({
                $or: [{'email': data.email.toLowerCase()}, {'username': data.email.toLowerCase()}],
                reset_password_code: data.code,
                reset_password_code_expires: {$gt: Date.now()}
            });

            if (!getUser) {
                return {
                    success: false,
                    message: "Something went wrong while resetting your password. Please try again.",
                    response: "Password reset error"
                }
            }

            if (getUser?.slug !== data?.user?.slug) {
                return {
                    success: false,
                    message: "Something went wrong while resetting your password. Please try again.",
                    response: "Access Denied"
                }
            }

            getUser.reset_password_code = null;
            getUser.reset_password_code_expires = null;
            getUser.password = await Utils.encryptPassword(data.password);
            await getUser.save();

            return  {
                success: true,
                response: 'Password Changed',
                message: 'Your password has been updated successfully.',
                errors: {}
            };
        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }


    //Send Email Verification Code
    async sendEmailVerificationCode(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.email)) {
                errors.email = 'Email or username is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            let getUser = await this.userData(data);

            if (!getUser) {
                return {
                    success: false,
                    message: "Account not found. Please verify your email address or username and try again.",
                    response: "The provided credentials do not match any existing account."
                }
            }

            getUser = await this.update({
                slug: getUser.slug,
                confirm_email_code: Utils.generate6DigitCode(),
            })

            await Notifications.emailVerificationCode({
                slug: getUser.slug,
                code: getUser.confirm_email_code
            });

            return  {
                success: true,
                errors: {},
                response: 'Verification Code Sent',
                message: 'A verification code has been sent to your email.'
            };
        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }


    //Confirm Email
    async confirmEmail(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.email)) {
                errors.email = 'Email or username is required';
            }

            if (Utils.isEmpty(data.code)) {
                errors.code = 'Code is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            const getUser = await this.findOne({
                $or: [{'email': data.email.toLowerCase()}, {'username': data.email.toLowerCase()}],
                confirm_email_code: data.code,
            });


            if (!getUser) {
                return {
                    success: false,
                    message: "The verification code you entered is invalid. Please try again.",
                    response: "Invalid verification code",
                    error: null,
                    token: null
                }
            }

            getUser.confirm_email_code =  null;
            getUser.email_verified = true;
            await getUser.save();

            const getUserData = await this.getUser(data);
            const token = await Utils.createToken(this.getUserPayload(getUser))

            return  {
                success: true,
                token: token,
                data: getUserData,
                errors: {},
                response: 'Email Confirmed',
                message: 'Your email has been successfully confirmed.'
            };
        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }


    //Verify Auth Token
    async verifyAuthToken(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.token)) {
                errors.token = 'Token is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            const verify = await Utils.verifyToken(data.token);

            if(verify.valid){
                const getUser = await this.getUser(verify.data);
                return  {
                    success: true,
                    data: getUser,
                    message: 'The token is valid.',
                    error: ''
                };
            } else {
                return  {
                    success: false,
                    data: {},
                    message: 'The token is invalid.',
                    error: ''
                };
            }
        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }


    /*************************************************
     Enable 2FA for the user
     ************************************************/
    async requestTwoFactorAuth(data = this.props) {
        try {
            const errors = {};

            data.slug = data?.user?.slug

            if (Utils.isEmpty(data.slug)) {
                errors.slug = 'Slug is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            /*if(data?.user?.slug !== data.slug){
                return  {
                    success: true,
                    data: {},
                    response: 'Access Denied',
                    message: 'You do not have permission to access this resource.',
                    error: ''
                };
            }*/

            const getUser = await this.userData(data);

            const secret = authenticator.generateSecret();
            const otpauthUrl = authenticator.keyuri(getUser.email, config.authenticator_issuer, secret);
            const qr_code = await qrcode.toDataURL(otpauthUrl);

            await this.update({
                slug: data.slug,
                two_factor_secret: secret
            })

            return  {
                success: true,
                secret: secret,
                qr_code: qr_code,
                message: 'Two-factor authentication setup initiated successfully.',
                error: ''
            };

        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }

    async enableTwoFactorAuth(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.slug)) {
                errors.slug = 'Slug is required';
            }

            if (Utils.isEmpty(data.code)) {
                errors.code = 'code is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            if(data?.user?.slug !== data.slug){
                return  {
                    success: true,
                    data: {},
                    response: 'Access Denied',
                    message: 'You do not have permission to access this resource.',
                    error: ''
                };
            }

            const getUser = await this.userData(data);

            const verified = speakeasy.totp.verify({
                secret: getUser.two_factor_secret,
                encoding: 'base32',
                token: data.code, // The TOTP code from the user
            });

            if(!verified){
                return {
                    success: false,
                    verified: verified,
                    message: 'Invalid 2FA code',
                    error: ''
                }
            }

            await this.update({
                slug: data.slug,
                two_factor_enabled: true
            })

            return {
                success: true,
                verified: verified,
                message: '2FA enabled successfully',
                error: ''
            }

        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }

    async verifyTwoFactorAuth(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.slug)) {
                errors.slug = 'Slug is required';
            }

            if (Utils.isEmpty(data.code)) {
                errors.code = 'code is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            if(data?.user?.slug !== data.slug){
                return  {
                    success: true,
                    data: {},
                    response: 'Access Denied',
                    message: 'You do not have permission to access this resource.',
                    error: ''
                };
            }

            const getUser = await this.userData(data);

            authenticator.options = {
                window: 1, // Allows checking current, previous, and next time slices
            };
            const totop_verify = authenticator.check(data.code.toString(), getUser.two_factor_secret);

            if (!totop_verify) {
                return {
                    success: false,
                    message: 'Invalid two-factor authentication code. Please try again.',
                    error: ''
                }
            }

            return {
                success: true,
                message: 'Two-factor authentication verified successfully.',
                error: ''
            }

        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }

    async disableTwoFactorAuth(data = this.props) {
        try {
            const errors = {};

            if (Utils.isEmpty(data.slug)) {
                errors.slug = 'Slug is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    response: "Fields",
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            if(data?.user?.slug !== data.slug){
                return  {
                    success: true,
                    data: {},
                    response: 'Access Denied',
                    message: 'You do not have permission to access this resource.',
                    error: ''
                };
            }

            await this.update({
                slug: data.slug,
                two_factor_enabled: false,
                two_factor_secret: null,
            })

            return {
                success: true,
                message: 'Two-factor authentication has been disabled successfully.',
                error: ''
            }

        } catch (error) {
            return {
                success: false,
                response: "Error",
                message: "There was an error, please try again!",
            }
        }
    }


}


module.exports = Auth