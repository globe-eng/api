const Post = require('../models/blogPostModel');
const Category = require('../models/blogCategoryModel');
const Tag = require('../models/blogTagModel');
const config = require('../../../lib/config');
const utils = require('../../../utils');
const cloudinary = require('../../../lib/cloudinary')
const aws = require("../../../lib/aws/awsController");

/*************************************************
 *          Post                                 *
 ************************************************/

// Get Posts
exports.getPosts = async (req, res) => {
    const query = req.query;
    query.limit = parseInt(query.limit) || 10;
    query.page = parseInt(query.page) || 1;
    query.detail = (query.detail || null);
    query.post = (query.post || null);

    try {

        const pipeline = [];

        // Related posts
        const currentPost = await Post.findOne({
            $or: [
                {slug: query.post},
                {slug_title: query.post}
            ]
        }).lean();


        if (currentPost) {
            //console.log(currentPost);
            pipeline.push({
                $match: {slug: {$ne: currentPost.slug}}
            });
            pipeline.push({
                $match: {
                    $or: [
                        {category: currentPost.category},
                        {tags: {$in: currentPost.tags || []}}
                    ]
                }
            });
        }

        if (query.slug) {
            pipeline.push({
                $match: {slug: query.slug}
            });
        }

        if (query.slug_title) {
            pipeline.push({
                $match: {slug_title: query.slug_title}
            });
        }

        if (query.tag) {
            pipeline.push({
                $match: {tag: query.tag}
            });
        }

        if (query.category) {
            const category = await Category.findOne({slug_name: query.category}).lean();
            //console.log(category);
            pipeline.push({
                $match: {category: category.slug}
            });
        }

        if (query.author) {
            pipeline.push({
                $match: {author: query.author}
            });
        }


        if (query.status) {
            pipeline.push({
                $match: {status: query.status}
            });
        }

        if (query.search) {
            pipeline.push({
                $match: {title: {$regex: query.search, $options: 'i'}},
            });
        }

        pipeline.push({
            $sort: {
                created_at: -1
            }
        });

        // Lookup stage to get the count of posts for each category
        pipeline.push({
            $lookup: {
                from: "blog_comment", // The name of the blog_post collection
                localField: "slug", // The field in Category to match
                foreignField: "post", // The field in blog_post to match
                as: "comments"
            }
        });

        // Add posts_count field
        pipeline.push({
            $addFields: {
                comments: {$size: "$comments"}
            }
        });

        pipeline.push({
            $lookup: {
                from: "blog_category",
                let: {slugValue: "$category"},
                pipeline: [
                    {$match: {$expr: {$eq: ["$slug", "$$slugValue"]}}},
                    {
                        $project: {_id: 0, name: 1, slug_name: 1, slug: 1}
                    }
                ],
                as: "category"
            }
        })
        pipeline.push({$addFields: {category: {$arrayElemAt: ["$category", 0]}}});

        pipeline.push({
            $lookup: {
                from: "blog_tag",
                localField: 'tag', // The `tags` field in `Post`
                foreignField: 'slug', // The `_id` field in `Tag`
                pipeline: [
                    {
                        $project: {_id: 0, name: 1, slug_name: 1, slug: 1}
                    }
                ],
                as: "tag"
            }
        })

        if (query.detail) {
            pipeline.push({
                $project: {
                    __v: 0,
                    _id: 0,
                }
            })
        } else {
            pipeline.push({
                $project: {
                    __v: 0,
                    _id: 0,
                    content: 0,
                }
            })
        }


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


        const result = await Post.aggregate(pipeline);
        const get_data = (query.pagination || query.infinite) ? result[0].data : result;

        //console.log(query);

        if (query.slug || query.slug_title || query.single) {
            return res.json(get_data[0] || null)
        } else {
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
        }

    } catch (error) {
        //console.log(error)
        return res.json((query.slug || query.slug_title || query.single) ? null : []);
    }
}

// Create Post
exports.createPost = async (req, res) => {
    try {
        const errors = {};
        const body = req.body;
        const files = req.files;

        if (utils.isEmpty(body.title)) {
            errors.title = 'Title is required';
        }

        if (utils.isEmpty(body.excerpt)) {
            errors.excerpt = 'Excerpt is required';
        }

        if (utils.isEmpty(body.content)) {
            errors.content = 'content is required';
        }

        if (utils.isEmpty(body.author)) {
            errors.author = 'Author is required';
        }

        if (utils.isEmpty(body.category)) {
            errors.category = 'Category is required';
        }

        if (utils.isEmpty(body.status)) {
            errors.status = 'status is required';
        }

        //Check validation
        if (!utils.isEmpty(errors)) {
            return res.json({
                success: false,
                message: 'Please enter the required fields',
                errors: errors
            });
        } else {

            const post = new Post();

            let slug = await utils.createSlug(Post);
            const SlugTitle = utils.toKebabCase(body.title);
            const slug_title = (await Post.exists({slug_title: SlugTitle}))
                ? `${SlugTitle}${await utils.createUniqueID()}` : SlugTitle;

            post.slug = slug;
            post.slug_title = slug_title;
            post.title = body.title;
            post.content = body.content;
            post.excerpt = body.excerpt;
            post.author = body.author;
            post.status = body.status;

            if (body.category) {
                //post.category = body.category.split(',')
                post.category = body.category
            }

            if (body.tag) {
                post.tag = body.tag.split(',')
                //post.tag = body.tag
            }

            if (!utils.isEmpty(req.files) && !utils.isEmpty(req.files.image)) {
                const file = files.image;

                const uploadMedia = await cloudinary.upload({
                    folder: `post/${slug}`,
                    media: file.filepath,
                    name: await utils.createUniqueID(),
                });

                //console.log(uploadMedia)
                if (uploadMedia.success) {
                    post.image = uploadMedia.link;
                    post.image_path = uploadMedia.path;
                    post.image_key = uploadMedia.key;
                }
            }

            await post.save();

            return res.json({
                success: true,
                message: 'Post Created Successfully',
                errors: ''
            });

        }
    } catch (errors) {
        console.log(errors)
        return res.json({
            success: false,
            response: 'An Error Occurred',
            //errors: errors,
            message: 'There was an error, please try again'
        });
    }
};

// Edit Post
exports.editPost = async (req, res) => {
    try {
        const errors = {};
        const body = req.body;
        const files = req.files;

        if (utils.isEmpty(body.title)) {
            errors.title = 'Title is required';
        }

        if (utils.isEmpty(body.excerpt)) {
            errors.excerpt = 'Excerpt is required';
        }

        if (utils.isEmpty(body.content)) {
            errors.content = 'content is required';
        }

        if (utils.isEmpty(body.author)) {
            //errors.author = 'Author is required';
        }

        if (utils.isEmpty(body.category)) {
            errors.category = 'Category is required';
        }

        if (utils.isEmpty(body.slug)) {
            errors.slug = 'Slug is required';
        }

        //Check validation
        if (!utils.isEmpty(errors)) {
            return res.json({
                success: false,
                message: 'Please enter the required fields',
                errors: errors
            });
        } else {

            const post = await Post.findOne({slug: body.slug});

            if (!post) {
                return res.json({
                    success: false,
                    message: 'Post not found',
                    response: 'Not Found',
                    errors: ''
                });
            }

            const SlugTitle = utils.toKebabCase(body.title);
            const slug_title = (await Post.exists({slug_title: SlugTitle}))
                ? `${SlugTitle}${await utils.createUniqueID()}` : SlugTitle;

            post.title = body.title;
            post.slug_title = slug_title;
            post.content = body.content;
            post.excerpt = body.excerpt;
            post.status = body.status;

            if (body.category) {
                post.category = body.category
                //post.category = body.category
            }

            //console.log(body.tag)

            if (body.tag) {
                post.tag = body.tag.split(',')
            }

            if (!utils.isEmpty(req.files) && !utils.isEmpty(req.files.image)) {
                const file = files.image;
                const uploadMedia = await cloudinary.upload({
                    folder: `post/${post.slug}`,
                    media: file.filepath,
                    name: await utils.createUniqueID(),
                });

                //console.log(uploadMedia)

                if (uploadMedia.success) {
                    if (post.image_key) {
                        await cloudinary.delete(post.image_key);
                    }
                    post.image = uploadMedia.link;
                    post.image_path = uploadMedia.path;
                    post.image_key = uploadMedia.key;
                }
            }

            await post.save()

            return res.json({
                success: true,
                message: 'Post Updated Successfully',
                errors: ''
            });

        }
    } catch (errors) {
        console.log(errors)
        return res.json({
            success: false,
            response: 'An Error Occurred',
            errors: errors,
            message: 'There was an error updating post'
        });
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findOne({slug: req.params.slug});

        if (!post) {
            return res.json({
                success: false,
                response: 'Post Not Found',
                message: 'Post not found'
            });
        }

        await Post.findOneAndDelete({slug: req.params.slug});

        if (post.image_key) {
            await cloudinary.delete(post.image_key);
        }

        return res.json({
            success: true,
            errors: {},
            response: 'Post Deleted',
            message: 'Post successfully deleted'
        });

    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            //error: error,
            response: 'An Error Occurred',
            message: 'There was an error deleting post'
        });
    }
};

// View  Post
exports.viewPost = async (req, res) => {
    try {
        const errors = {};
        const body = req.body;

        if (utils.isEmpty(body.ip)) {
            errors.ip = 'Ip is required';
        }

        if (utils.isEmpty(body.slug)) {
            errors.slug = 'slug is required';
        }

        //Check validation
        if (!utils.isEmpty(errors)) {
            return res.json({
                success: false,
                message: 'Please enter the required fields',
                errors: errors
            });
        }


        const post = await Post.findOne({slug: body.slug, views: body.ip});

        if (post) {
            return res.json({
                success: true,
                message: 'Already viewed',
                response: '',
                errors: {}
            });
        }

        const newView = await Post.findOneAndUpdate({slug: req.body.slug}, {
            '$push': {
                'views': body.ip
            }
        });

        return res.json({
            success: true,
            message: 'Successfully viewed',
            response: '',
            errors: {}
        });

    } catch (errors) {
        return res.json({
            success: false,
            response: 'An Error Occurred',
            //errors: errors,
            message: 'There was an error viewing post'
        });
    }
};

// Like Post
exports.likePost = async (req, res) => {
    try {
        const errors = {};
        const body = req.body;

        if (utils.isEmpty(body.user)) {
            errors.user = 'user is required';
        }

        if (utils.isEmpty(body.slug)) {
            errors.slug = 'slug is required';
        }

        //Check validation
        if (!utils.isEmpty(errors)) {
            return res.json({
                success: false,
                message: 'Please enter the required fields',
                errors: errors
            });
        }

        const post = await Post.findOne({slug: body.slug, likes: body.user});
        if (post) {
            const unLike = await Post.findOneAndUpdate({slug: body.slug}, {
                '$pull': {
                    'likes': body.user
                }
            });
            return res.json({
                success: true,
                message: 'Post unlike',
                response: '',
                errors: {}
            });
        } else {
            const newLike = await Post.findOneAndUpdate({slug: req.body.slug}, {
                '$push': {
                    'likes': body.user
                }
            });
            return res.json({
                success: true,
                message: 'Post liked',
                response: '',
                errors: {}
            });
        }
    } catch (errors) {
        return res.json({
            success: false,
            response: 'An Error Occurred',
            //errors: errors,
            message: 'There was an error liking post'
        });
    }
};














