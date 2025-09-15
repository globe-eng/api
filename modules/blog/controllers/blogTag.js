const Tag = require('../models/blogTagModel');
const Post = require('../models/blogPostModel');
const utils = require('../../../utils');


// Get Tags
exports.getTags = async (req, res) => {
    const query = req.query;
    query.limit = parseInt(query.limit) || 10;
    query.page = parseInt(query.page) || 1;

    try {

        const pipeline = [];

        if (query.slug) {
            pipeline.push({
                $match: {slug: query.slug}
            });
        }

        if (query.slug_name) {
            pipeline.push({
                $match: {slug_name: query.slug_name}
            });
        }

        pipeline.push({
            $sort: {
                name: 1
            }
        })

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


        const result = await Tag.aggregate(pipeline);
        const get_data = (query.pagination || query.infinite) ? result[0].data : result;

        if(query.slug || query.slug_name){
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
        return res.json(query.slug? null : []);
    }
}

// Add Tag
exports.addTag = async (req, res) => {
    try {

        const errors = {};
        const body = req.body;
        const files = req.files;

        if (utils.isEmpty(body.name)) {
            errors.name = 'Name is required';
        }

        //Check validation
        if (!utils.isEmpty(errors)) {
            return res.json({
                success: false,
                message: 'Please enter the required body',
                errors: errors
            });
        } else {


            const tag = new Tag()

            let slug = await utils.createSlug(Tag);
            const SlugName = utils.toKebabCase(body.name);
            const slug_name = (await Tag.exists({slug_name: SlugName}))
                ? `${SlugName}${utils.createUniqueID()}` : SlugName;


            tag.name = utils.capitalizeEveryWordFirstLetter(body.name);
            tag.slug = slug;
            tag.slug_name = slug_name;

            await tag.save()

            return res.json({
                success: true,
                message: 'Tag Added Successfully',
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

// edit Tag
exports.editTag = async (req, res) => {
    try {
        const errors = {};
        const body = req.body;
        const files = req.files;

        if (utils.isEmpty(body.name)) {
            errors.name = 'Name is required';
        }

        if (utils.isEmpty(body.slug)) {
            errors.slug = 'slug is required';
        }

        //Check validation
        if (!utils.isEmpty(errors)) {

            return res.json({
                success: false,
                message: 'Please enter the required body',
                errors: errors
            });
        } else {
            const tag = await Tag.findOne({slug: body.slug})

            if (!tag) {
                return res.json({
                    success: false,
                    response: 'Not Found',
                    message: 'Tag not found',
                    errors: {}
                });
            }

            const SlugName = utils.toKebabCase(body.name);
            const slug_name = (await Tag.exists({slug_name: SlugName, slug: { $ne: body.slug }}))
                ? `${SlugName}${utils.createUniqueID()}` : SlugName;

            tag.name = body.name;
            tag.slug_name = slug_name;


            await tag.save();

            return res.json({
                success: true,
                message: 'Tag Updated Successfully',
                errors: ''
            });

        }
    } catch (error) {
        //console.log(error)
        return res.json({
            success: false,
            //error: error,
            response: 'An Error Occurred',
            message: 'There was an error editing tag'
        });
    }
};

// Delete Tag
exports.deleteTag = async (req, res) => {
    try {
        const slug = req.params.slug;
        const tag = await Tag.findOne({slug: slug});

        if (!tag) {
            return res.json({
                success: false,
                response: 'Tag Not Found',
                message: 'Tag not found'
            });
        }

        await Tag.findOneAndRemove({slug});

        return res.json({
            success: true,
            errors: {},
            response: 'Tag Deleted',
            message: 'Tag successfully deleted'
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
