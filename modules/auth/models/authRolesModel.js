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
    collection: "auth-roles",
}

const schema = new mongoose.Schema({
    //slug: {type: String, trim: true, required: true, unique: true, index: true},
    name: { type: String, enum: ['user', 'admin', 'superadmin'], required: true, unique: true },
    permissions: [{ type: String }] // e.g., ['user:read', 'user:create', 'admin:dashboard']
}, options);

module.exports = mongoose.model(options.collection, schema)
