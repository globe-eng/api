const mongoose = require('mongoose');
//const { ObjectId } = mongoose.Schema;
const enums = require('../../../lib/enums');
const config = require('../../../lib/config');

const options = {
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
    toObject: {getters: true},
    autoIndex: false,
    autoCreate: false,
    minimize: true, // "minimize" schemas by removing empty objects
    selectPopulatedPaths: true,
    collection: "users"
}

const schema = new mongoose.Schema({
    slug: {type: String, trim: true, required: true, unique: true, index: true},
    first_name: {type: String, required: true, min: config.name_min, max: config.name_max},
    last_name: {type: String, required: true, min: config.name_min, max: config.name_max},
    middle_name: {type: String, min: config.name_min, max: config.name_max},
    email: {type: String, trim: true, required: true, max: 32, unique: true, lowercase: true},
    username: {type: String, unique: true, lowercase: true, required: false, min: config.username_min, max: config.username_max},
    gender: {type: String, enum: enums.gender, default: null},

    account_type: {type: String},
    id_type: {type: String},
    id_number: {type: String},
    about_me: {type: String},
    occupation: {type: String,},
    phone_number: {type: String},
    telegram_username: {type: String},
    //relationship_status: {type: String, enum: enums.relationship_status, default: null},
   // religion: {type: String, enum: enums.religion},
    date_of_birth: {type: String},
    email_verified: {type: Boolean, default: false},
    phone_verified: {type: Boolean, default: false},
    deleted: {type: Boolean, default: false},
    photo: {type: String},
    photo_key: {type: String},
    photo_path: {type: String},
    settings: {
        emailNotifications: {type: Boolean, default: true},
        smsNotifications: {type: Boolean, default: true},
        newsletter: {type: Boolean, default: true},
    },


    document_type: {type: String},
    document_front: {type: String},
    document_back: {type: String},
    signature: {type: String},

    // Location
    country: {type: String},
    state: {type: String},
    city: {type: String},


    // Authentication
    role: {type: String, default: 'user'},
    reset_password_code: {type: String},
    reset_password_code_expires: {type: Date},
    two_factor_enabled: { type: Boolean, default: false},
    two_factor_secret: { type: String }, // To store the user's 2FA secret
    confirm_email_code: {type: String},
    password: {type: String, required: true},
    login_attempts: { type: Number, default: 0},
    lock_until: { type: Date },

    last_withdrawal: {type: Date},

    // Presences
    online: {type: Boolean, default: false},
    last_seen: {type: Date},
    last_login: {type: String},
}, options);


schema.virtual('full_name').get(function () {
    return `${this.first_name} ${this.last_name}`;
});

schema.virtual('id').get(function () {
    return this._id
});

// Virtual field to check if the account is currently locked
schema.virtual('is_locked').get(function() {
    return !!(this.lock_until && new Date(this.lock_until)?.getTime() > Date.now());
});


// Static method to handle login attempts and locking
schema.methods.incrementLoginAttempts = function() {
    // If the account is already locked, and the lock has expired, reset login attempts
    if (this.lock_until && this.lock_until < Date.now()) {
        this.login_attempts = 1;
        this.lock_until = undefined;
    } else {
        this.login_attempts += 1;
        //Lock the account if max attempts are reached
        if (this.login_attempts >= config.login_max_attempts) {
            this.lock_until = Date.now() + config.login_lock_time; // LOCK_TIME in milliseconds
        }
    }
    return this.save();
};

module.exports = mongoose.model(options.collection, schema)
