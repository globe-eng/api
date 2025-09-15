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
    collection: "blog_comment"
}

const schema = new mongoose.Schema({
    slug: {type: String, trim: true, required: true, unique: true, index: true},
    comment: {type: String, trim: true, required: true,},
    isReply: {type: Boolean, required: true},
    user: {type: String, required: true},
    post: {type: String, required: true},
    parent: {type: String},
    parentCheck: {type: String},
    likes: [{
        user: {type: String},
        like: {type: Number},
    }],
    views: [{
        user: {type: String},
        view: {type: Number},
    }],
}, options)

module.exports = mongoose.model(options.collection, schema)


/*blogPost.virtual('commentsCount').get(function () {
    try {
        commentReplies = (parentId = "", data) => {
            const commentData = data?.filter(doc => parentId == doc.parentCheck);
            let comments = [];
            for (let comment of commentData) {
                comments.push({
                    ...comment?._doc,
                    replies: commentReplies(comment._id, data)
                })
            }
            return comments;
        }

        const commentsCount = commentReplies('', this.comments)
        delete this.comments;
        return commentsCount ? commentsCount.length : 0;
    } catch (e) {
    }
});*/




