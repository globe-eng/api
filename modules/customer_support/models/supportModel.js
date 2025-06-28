const mongoose = require('mongoose');
//const { ObjectId } = mongoose.Schema;
const enums = require('../../../lib/enums')

const options = {
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
    toObject: {getters: true},
    autoIndex: false,
    autoCreate: false,
    minimize: true, // "minimize" schemas by removing empty objects
    selectPopulatedPaths: true,
    collection: "support-ticket"
}


const schema = new mongoose.Schema({
    slug: {type: String, trim: true, required: true, unique: true, index: true, lowercase: true},
    user: {type: String, trim: true, required: true, index: true, lowercase: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    status: {type: String, enum: ['Open', 'Closed'], default: 'Open'},
}, options);


module.exports = mongoose.model(options.collection, schema)





