const emailValidator = require("email-validator");
const crypto = require('crypto');
const passwordValidator = require('password-validator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtDecode = require('jwt-decode');
const config = require("./config");
const User = require("../modules/user/models/userModel");
const password_schema = new passwordValidator();


// password_schema config
password_schema
    .is().min(8, "Password should have a minimum length of 8 characters")                                    // Minimum length 8
    .is().max(100, "Password should have a maximum length of 50 characters")                                  // Maximum length 100
    .has().symbols(1, "Password should have a minimum of 1 special character")                                 // Must have symbols
    .has().uppercase(1, "Password should have a minimum of 1 uppercase")                              // Must have uppercase letters
    //.has().lowercase(1,"Password should have a minimum of 1 lowercase")                              // Must have lowercase letters
    .has().digits(1, "Password should have a minimum of 1 number")                               // Must have at least 2 digits
    .has().not().spaces(null, "Password should not have spaces")                           // Should not have spaces
    .is().not().oneOf(['Password', 'Password123']); // Blacklist these values


class Utils {


    /**
     isEmpty
     Returns true if the value is an empty object, collection, has no enumerable properties or is any type that is not considered a collection.
     Check if the provided value is null or if its length is equal to 0.
     */
    static isEmpty(value) {
        return value === null || value === undefined || value === 'undefined' || value === "" || !(Object.keys(value) || value).length || !value.toString();
    }

    static isEmail(value) {
        return emailValidator.validate(value)
    }

    static isPassword(value) {
        return {
            valid: password_schema.validate(value),
            message: "Password does not meet security requirements",
            requirements: password_schema.validate(value, {details: true}),
        }
    }

    static async encryptPassword(value) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(value, salt)
        return hash
    }

    static async decryptPassword(input, user_password) {
        return  await bcrypt.compare(input, user_password)
    }

    static async createToken(payload) {
        return  await jwt.sign(payload, config.secretOrKey, {expiresIn: config.tokenExpiringDate});
    }

    static async verifyToken(token) {
        try {
            const verify = await jwt.verify(token, config.secretOrKey)
            const tokenToDecode = 'Bearer ' + token;
            const decoded = jwtDecode.jwtDecode(tokenToDecode);

            if(decoded){
                if(await User.exists({ slug: decoded.slug })){
                    return {
                        valid: true,
                        data: decoded
                    }
                } else {
                    return {
                        valid: false
                    }
                }
            }  else {
                return {
                    valid: false
                }
            }
        } catch (e) {
            //console.log(e)
            return {
                valid: false
            }
        }
    }

    static async createResetPasswordToken(payload) {
        return  await jwt.sign(payload, config.secretOrKey, {expiresIn: config.resetPasswordTokenExpiringDate});
    }

    static async createSlug(Model, length = 5) {
        const { customAlphabet } = await import('nanoid');
        const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const nanoid = customAlphabet(alphabet, length);

        let slug;

        const hasLetter = str => /[a-z]/.test(str);
        const hasNumber = str => /[0-9]/.test(str);

        do {
            slug = nanoid().toLowerCase(); // already lowercase, but ensures consistency
        } while (
            !(hasLetter(slug) && hasNumber(slug)) ||
            await Model.exists({ slug })
            );

        return slug;
    }

    static async createUniqueID(length = 5) {
        const { customAlphabet } = await import('nanoid');
        const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const nanoid = customAlphabet(alphabet, length);

        let slug;

        const hasLetter = str => /[a-z]/.test(str);
        const hasNumber = str => /[0-9]/.test(str);

        do {
            slug = nanoid().toLowerCase(); // already lowercase, but ensures consistency
        } while (!(hasLetter(slug) && hasNumber(slug)));

        return slug;
    }

    static capitalizeEveryWordFirstLetter(string) {
        string.toLowerCase();
        return string.replace(/\b[a-z]/g, char => char.toUpperCase());
    }

    static toLowerCase(string) {
        return string.toLowerCase()
    }

    static toUpperCase(string) {
        return string.toUpperCase()
    }

    static generate6DigitCode() {
        return crypto.randomBytes(3).toString('hex').toUpperCase();
    }



}


module.exports = Utils