const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const options = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toObject: {getters: true},
    autoIndex: false,
    autoCreate: false,
    minimize: true, // "minimize" schemas by removing empty objects
    selectPopulatedPaths: true,
    collection: "notifications"
}

const schema = new mongoose.Schema({
    slug: {type: String, trim: true, required: true, unique: true, index: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    role: {type: String, required: true},
    photo: {type: String},
    photo_key: {type: String},
    photo_path: {type: String},
},  options);


module.exports = mongoose.model(options.collection, schema);
