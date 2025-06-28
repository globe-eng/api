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
    collection: "support-ticket-messages",
}


const schema = new mongoose.Schema({
    slug: {type: String, trim: true, required: true, unique: true, index: true, lowercase: true},
    ticket: {type: String, required: true, index: true},
    sender: {type: String, required: true},
    receiver: {type: String, required: true},
    message: {type: String},
    image: {type: String},
    image_path: {type: String},
    image_key: {type: String},
    type: {type: String, required: true}, // text | image
    read: {type: Boolean, default: false},
}, options);


module.exports = mongoose.model(options.collection, schema)





