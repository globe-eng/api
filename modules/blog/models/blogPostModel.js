const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const {ObjectId} = mongoose.Schema;

const options = {
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
    toObject: {getters: true},
    autoIndex: false,
    autoCreate: false,
    minimize: true, // "minimize" schemas by removing empty objects
    selectPopulatedPaths: true,
    collection: "blog_post"
}

const schema = new mongoose.Schema({
    slug: {type: String, trim: true, required: true, unique: true, index: true},
    slug_title: {type: String, trim: true, required: true, unique: true, index: true},
    title: {type: String, required: true},
    excerpt: {type: String, required: true,},
    content: {type: String, required: true},
    author: {type: String, required: true},
    status: {type: String, default: 'Unpublished'}, // Published | Unpublished
    image: {type: String},
    image_path: {type: String},
    image_key: {type: String},
    category: {type: String},
    tag: [{type: String, required: true}],
    views: [{type: String, required: true}],
    likes: [{type: String, required: true}],
}, options);

module.exports = mongoose.model(options.collection, schema)


