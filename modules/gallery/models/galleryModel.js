const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const options = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toObject: {getters: true},
    autoIndex: false,
    autoCreate: false,
    minimize: true, // "minimize" schemas by removing empty objects
    selectPopulatedPaths: true,
    collection: "gallery"
}

const schema = new mongoose.Schema({
    slug: {type: String, trim: true, required: true, unique: true, index: true},
    name: {type: String, required: true},
    description: {type: String},
    category: {type: String, required: true},
    image: {type: String},
    image_key: {type: String},
    image_path: {type: String},
},  options);


module.exports = mongoose.model(options.collection, schema);
