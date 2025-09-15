const Comment = require('../models/blogCommentModel');
const config = require('../../../lib/config');

const utils = require('../../../utils');
const cloudinary = require('../../../lib/cloudinary')
const aws = require("../../../lib/aws/awsController");
const Category = require("../models/blogCategoryModel");


/*************************************************
 *                 Comments                       *
 * ***********************************************/

commentReplies = (parentId = "", data) => {
    const commentData = data.filter(doc => parentId == doc.parentCheck);
    let comments = [];
    for (let comment of commentData) {
        comments.push({
            ...comment?._doc,
            replies: commentReplies(comment._id, data)
        })
    }
    return comments;
}

// Get  Comments
exports.getComments = async (req, res) => {
    const query = req.query;
    query.limit = parseInt(query.limit) || 10;
    query.page = parseInt(query.page) || 1;

    console.log(query)

    try {

        const pipeline = [];

        pipeline.push({
            $match: {post: query.post}
        });


        pipeline.push({
            $sort: {
                created_at: 1
            }
        });

        pipeline.push({
            $lookup: {
                from: "users",
                let: {slugValue: "$user"},
                pipeline: [
                    {$match: {$expr: {$eq: ["$slug", "$$slugValue"]}}},
                    {
                        $project: {
                            first_name: 1,
                            last_name: 1,
                            username: 1,
                            slug: 1,
                            photo: 1,
                        }
                    }
                ],
                as: "user"
            }
        });
        pipeline.push({
            $addFields: {
                user: {$arrayElemAt: ["$user", 0]}
            }
        });

        pipeline.push({
            $project: {
                __v: 0,
                _id: 0,
            }
        })

        if (query && (query.pagination || query.infinite)) {
            // pagination stage to paginate documents
            if (!query || !query.page || !query.limit || isNaN(parseInt(query.page)) || isNaN(parseInt(query.limit))) {
                // handle invalid query parameters
                pipeline.push({
                    $facet: {
                        metadata: [
                            {$count: 'total'},
                            {
                                $addFields: {
                                    limit: 0,
                                    page: 0
                                }
                            }
                        ],
                        data: [
                            {$project: {_id: 0}}
                        ]
                    }
                });
            } else {
                // handle valid query parameters
                pipeline.push({
                    $facet: {
                        metadata: [
                            {$count: 'total'},
                            {
                                $addFields: {
                                    limit: parseInt(query.limit, 10),
                                    page: parseInt(query.page)
                                }
                            },
                            {
                                $project: {
                                    totalPages: {
                                        $ceil: {
                                            $divide: ['$total', '$limit']
                                        }
                                    },
                                    total: 1,
                                    limit: 1,
                                    page: 1,
                                    hasNextPage: {
                                        $cond: [
                                            {$gt: [{$add: ['$page', 1]}, {$ceil: {$divide: ['$total', '$limit']}}]},
                                            false,
                                            true
                                        ]
                                    },
                                    hasPrevPage: {
                                        $cond: [{$lt: ['$page', 2]}, false, true]
                                    },
                                    prevPage: {

                                        $cond: [{$lt: ['$page', 2]}, null, {$subtract: ['$page', 1]}]
                                    },
                                    nextPage: {
                                        $cond: [
                                            {
                                                $gt: [
                                                    {$add: ['$page', 1]},
                                                    {$ceil: {$divide: ['$total', '$limit']}}
                                                ]
                                            },
                                            null,
                                            {$add: ['$page', 1]}
                                        ]
                                    }
                                }
                            }
                        ],
                        data: [
                            {$skip: (parseInt(query.page) - 1) * parseInt(query.limit)},
                            {$limit: parseInt(query.limit)},
                            {$project: {_id: 0}}
                        ]
                    }
                });
            }
        }

        const result = await Comment.aggregate(pipeline);
        const get_data = (query.pagination || query.infinite) ? result[0].data : result;


        if (query && query.pagination) {
            const metadata = result[0].metadata[0];
            // return the metadata and data
            return res.json({
                total: metadata?.total || 0,
                limit: metadata?.limit || query.limit,
                totalPages: metadata?.totalPages || 0,
                page: metadata?.page || 0,
                hasPrevPage: metadata?.hasPrevPage || null,
                hasNextPage: metadata?.hasNextPage || null,
                prevPage: metadata?.prevPage || null,
                nextPage: metadata?.nextPage || null,
                data: get_data || []
            });
        } else {
            return res.json(get_data)
        }

    } catch (error) {
        console.log(error)
        return res.json([]);
    }
}

// Post Comment
exports.postComment = async (req, res) => {
    try {
        const errors = {};
        const user = req.authUser;
        const body = req.body;

        if (utils.isEmpty(body.comment)) {
            errors.comment = 'Comment is required';
        }

        if (utils.isEmpty(body.post)) {
            errors.post = 'post is required';
        }

        if (utils.isEmpty(body.user)) {
            errors.user = 'user is required';
        }

        if (utils.isEmpty(body.isReply)) {
            //errors.isReply = 'isReply is required';
        }


        //Check validation
        if (!utils.isEmpty(errors)) {
            return res.json({
                success: false,
                errors: errors,
                response: 'Required Fields Missing',
                message: 'Please enter the required fields and try again'
            });
        } else {

            const comment = new Comment({});
            comment.slug = await utils.createSlug(Comment);
            comment.comment = body.comment;
            comment.parent = body.parent;
            comment.isReply = body.isReply;
            comment.user = body.user;
            comment.post = body.post;
            comment.parentCheck = utils.isEmpty(body.parent) ? "" : body.parent;

            await comment.save();

            return res.json({
                success: true,
                error: {},
                //errors: errors,
                data: null,
                response: 'Comment submitted',
                message: 'Comment has successfully been submitted'
            });
        }
    } catch (error) {
         console.log(error)
        return res.json({
            success: false,
            //error: error,
            response: 'An Error Occurred',
            message: 'There was an error submitting comment'
        });
    }
};

// Edit Comment
exports.editComment = async (req, res) => {
    try {
        const errors = {};
        const user = req.authUser;
        const body = req.body;

        if (utils.isEmpty(body.comment)) {
            errors.comment = 'Comment is required';
        }

        if (utils.isEmpty(body.slug)) {
            errors.slug = 'slug is required';
        }

        //Check validation
        if (!utils.isEmpty(errors)) {
            return res.json({
                success: false,
                errors: errors,
                response: 'Required Fields Missing',
                message: 'Please enter the required fields and try again'
            });
        } else {

            const comment = await Comment.findOne({slug: body.slug})

            if (!comment) {
                return res.json({
                    success: false,
                    response: 'Not Found',
                    message: 'Comment not found',
                    errors: {}
                });
            }

            comment.comment = body.comment;

            await comment.save();

            return res.json({
                success: true,
                error: {},
                //errors: errors,
                data: null,
                response: 'Comment Updated',
                message: 'Comment has successfully been updated'
            });

        }
    } catch (error) {
        //console.log(error)
        return res.json({
            success: false,
            //error: error,
            response: 'An Error Occurred',
            message: 'There was an error updating comment'
        });
    }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
    try {
        const slug = req.params.slug;
        const comment = await Comment.findOne({slug: slug});

        if (!comment) {
            return res.json({
                success: false,
                response: 'Comment Not Found',
                message: 'Comment not found'
            });
        }

        await Comment.findOneAndRemove({slug});

        return res.json({
            success: true,
            errors: {},
            response: 'Comment Deleted',
            message: 'Comment successfully deleted'
        });

    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            //error: error,
            response: 'An Error Occurred',
            message: 'There was an error, please try again'
        });
    }
};
