const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const options = {
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
    toObject: {getters: true},
    autoIndex: false,
    autoCreate: false,
    minimize: true, // "minimize" schemas by removing empty objects
    selectPopulatedPaths: true,
    collection: "blog_category"
}


const schema = new mongoose.Schema({
    slug: {type: String, trim: true, required: true, unique: true, index: true},
    slug_name: {type: String, trim: true, required: true, unique: true, index: true},
    name: { type: String, required: true },
    parent: {
        type: ObjectId,
        ref: 'blog_category',
        //required: true,
    },
    parentCheck: { type: String},
    image: { type: String},
    image_path: { type: String},
    image_key: { type: String},
}, options)

module.exports = mongoose.model(options.collection, schema)