const Category = require('../models/blogCategoryModel');
const Post = require('../models/blogPostModel');

const utils = require('../../../utils');
const cloudinary = require('../../../lib/cloudinary')




categoryTree = (parentId = "", docs) => {
    const category = docs.filter(doc => parentId == doc.parentCheck);
    let categories = [];
    for (let cat of category) {
        categories.push({
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            children: categoryTree(cat._id, docs)
        })
    }
    return categories;
}

// Get Categories
/*exports.getCategoriesWithChildren = async (req, res) => {
    try {
        const categories = await Category.find({})
            .select('-image')
            .populate({path: 'parent', select: 'id name'})
        //console.log(categories)
        return res.json({
            success: true,
            error: {},
            data: categoryTree('', categories),
            response: 'Success',
            message: ''
        });
    } catch (error) {
        return res.json({
            success: false,
            error: {},
            response: 'An Error Occurred',
            message: 'There was an error getting categories'
        });
    }
}*/

// Get Categories
exports.getCategories = async (req, res) => {
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

        // Lookup stage to get the count of posts for each category
        pipeline.push({
            $lookup: {
                from: "blog_post", // The name of the blog_post collection
                localField: "slug", // The field in Category to match
                foreignField: "category", // The field in blog_post to match
                pipeline: [
                    {$match: {status: "Published"}},
                ],
                as: "posts"
            }
        });

        // Add posts_count field
        pipeline.push({
            $addFields: {
                posts_count: { $size: "$posts" }
            }
        });

        // Remove unnecessary fields
        pipeline.push({
            $project: {
                posts: 0, // Exclude the posts array
                __v: 0,
                _id: 0
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


        const result = await Category.aggregate(pipeline);
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

// Add Category
exports.addCategory = async (req, res) => {
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


            const category = new Category()

            let slug = await utils.createSlug(Category);
            const SlugName = utils.toKebabCase(body.name);
            const slug_name = (await Category.exists({slug_name: SlugName}))
                ? `${SlugName}${utils.createUniqueID()}` : SlugName;


            category.name = utils.capitalizeEveryWordFirstLetter(body.name);
            category.slug = slug;
            category.slug_name = slug_name;
            category.parent = utils.isEmpty(body.parent) ? "5f61c3554befac0d889f62ef" : body.parent;
            category.parentCheck = utils.isEmpty(body.parent) ? "" : body.parent;

            if (!utils.isEmpty(req.files) && !utils.isEmpty(req.files.image)) {
                const file = files.image;
                const uploadMedia = await cloudinary.upload({
                    folder: `category/${slug}`,
                    media: file.filepath,
                    name: utils.createUniqueID(),
                });

                //console.log(uploadMedia)
                if (uploadMedia.success) {
                    category.image = uploadMedia.link;
                    category.image_path = uploadMedia.path;
                    category.image_key = uploadMedia.key;
                }
            }

            await category.save()

            return res.json({
                success: true,
                message: 'Category Added Successfully',
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

// edit Category
exports.editCategory = async (req, res) => {
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
            const category = await Category.findOne({slug: body.slug})

            if (!category) {
                return res.json({
                    success: false,
                    response: 'Not Found',
                    message: 'Category not found',
                    errors: {}
                });
            }

            const SlugName = utils.toKebabCase(body.name);
            const slug_name = (await Category.exists({slug_name: SlugName, slug: { $ne: body.slug }}))
                ? `${SlugName}${utils.createUniqueID()}` : SlugName;

            category.name = body.name;
            category.slug_name = slug_name;
            category.parent = utils.isEmpty(body.parent) ? "5f61c3554befac0d889f62ef" : body.parent;
            category.parentCheck = utils.isEmpty(body.parent) ? "" : body.parent;

            if (!utils.isEmpty(req.files) && !utils.isEmpty(req.files.image)) {
                const file = files.image;
                const uploadMedia = await cloudinary.upload({
                    folder: `category/${category.slug}`,
                    media: file.filepath,
                    name: utils.createUniqueID(),
                });

                //console.log(uploadMedia)
                if (uploadMedia.success) {

                    if (category.image_key) {
                        await cloudinary.delete(category.image_key);
                    }

                    category.image = uploadMedia.link;
                    category.image_path = uploadMedia.path;
                    category.image_key = uploadMedia.key;
                }
            }

            await category.save();

            return res.json({
                success: true,
                message: 'Category Updated Successfully',
                errors: ''
            });

        }
    } catch (error) {
        //console.log(error)
        return res.json({
            success: false,
            //error: error,
            response: 'An Error Occurred',
            message: 'There was an error editing category'
        });
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const slug = req.params.slug;
        const category = await Category.findOne({slug: slug});

        if (!category) {
            return res.json({
                success: false,
                response: 'Category Not Found',
                message: 'Category not found'
            });
        }

        if (category.image_key) {
            await cloudinary.delete(category.image_key);
        }

        await Category.findOneAndRemove({slug});

        return res.json({
            success: true,
            errors: {},
            response: 'Category Deleted',
            message: 'Category successfully deleted'
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

