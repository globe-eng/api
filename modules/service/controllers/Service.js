const Model = require('../models/serviceModel');
const TypeModel = require('../models/service_typeModel');
const Utils = require("../../../lib/Utils")
const config = require("../../../lib/config");
const mongoose = require("mongoose");


class Service {
    constructor(props = {}) {
        this.props = props;
        this.slug = props.slug;
        this._id = props._id
    }

    async find(filter = this.props) {
        return Model.find(filter)
    }

    async getData(data) {

        const pipeline = [];

        //IDs
        let _ids = [];
        if (data?.slug) {
            _ids.push({slug: data.slug.toLowerCase()});
        }
        if (data?._id) {
            const idVal = data._id;
            if (idVal instanceof mongoose.Types.ObjectId) {
                _ids.push({_id: idVal});
            } else if (mongoose.isValidObjectId(idVal)) {
                _ids.push({_id: new mongoose.Types.ObjectId(idVal)});
            }
        }
        if (_ids.length) {
            pipeline.push({
                $match: {
                    $or: _ids
                }
            });
        }

        pipeline.push({
            $lookup: {
                from: "service_type",
                let: {slugValue: "$type"},
                pipeline: [
                    {$match: {$expr: {$eq: ["$slug", "$$slugValue"]}}},
                    {
                        $project: {
                            _id: 0,
                            __v: 0,
                            created_at: 0,
                            updated_at: 0,
                        }
                    }
                ],
                as: "type"
            }
        });
        pipeline.push({$addFields: {type: {$arrayElemAt: ["$type", 0]}}});

        /* if(data.type){
             pipeline.push({
                 $match: {type: data.type}
             });
         }*/

        pipeline.push({
            $sort: {created_at: -1}
        });

        pipeline.push({
            $project: {
                __v: 0,
                created_at: 0,
                updated_at: 0,
            }
        })

        const data_pipeline = data?.pipeline ? data?.pipeline : []
        const new_pipeline = [
            ...pipeline,
            ...data_pipeline
        ]
        return Model.aggregate(new_pipeline);
    }

    async update(data = this.props) {

        data = {...data};

        let _ids = [];
        if (data?.slug) {
            _ids.push({slug: data.slug.toLowerCase()});
        }
        if (data?._id) {
            const idVal = data._id;
            if (idVal instanceof mongoose.Types.ObjectId) {
                _ids.push({_id: idVal});
            } else if (mongoose.isValidObjectId(idVal)) {
                _ids.push({_id: new mongoose.Types.ObjectId(idVal)});
            }
        }

        if (!_ids.length) {
            throw new Error('slug or _id is required');
        }

        const model = await Model.findOne({$or: _ids});

        if (!model) {
            throw new Error('Not found');
        }


        delete data.slug;
        delete data._id;

        for (let field in data) {
            model[field] = data[field]
        }

        return await model.save();
    }

    async create(data = this.props) {
        try {
            data = {...data};
            const errors = {};

            if (Utils.isEmpty(data.name)) {
                errors.name = 'Name is required';
            }

            if (Utils.isEmpty(data.type)) {
                errors.type = 'Type is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            let newModel = new Model()
            for (let field in data) {
                newModel[field] = data[field]
            }

            newModel.slug = await Utils.createSlug(Model);
            const result = await newModel.save();

            return {
                success: true,
                ...result._doc,
                save: async () => await result.save()
            }
        } catch (e) {
            console.log("Service > create:", e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            };
        }
    }

    async delete(data = this.props) {
        try {
            data = {...data};
            const errors = {};

            if (Utils.isEmpty(data.slug) && Utils.isEmpty(data._id)) {
                errors.slug = 'Slug or _id is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            const model = await Model.findOne({
                $or: [{slug: data.slug}, {_id: data._id}]
            });

            // Check if exists
            if (!model) {
                return {
                    success: false,
                    message: 'Not found',
                };
            }

            // Delete the model
            await model.deleteOne({slug: model.slug});

            return {
                success: true,
                message: 'Service has successfully been deleted',
                //investment: investment
            };
        } catch (e) {
            console.log("Service > delete:", e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            };
        }
    }

    async getService(data = this.props) {
        try {
            data = {...data};

            let ids = [];
            if (data.slug) ids.push({slug: data.slug.toLowerCase()});
            if (data._id) ids.push({_id: data._id});

            if (ids.length === 0) {
                return {
                    success: false,
                    message: 'Slug or _id is required',
                }
            }

            const pipeline = [];

            pipeline.push({
                $match: {
                    $or: ids
                }
            });

            data.pipeline = pipeline;
            const model = await this.getData(data);

            if (model[0]) {

                if(data.hide_content){
                    model[0].content = null;
                }

                return {
                    success: true,
                    ...model[0],
                }
            } else {
                return {
                    success: false,
                    message: 'Not found',
                }
            }
        } catch (e) {
            //console.log(e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            }
        }
    }

    async getServices(data = this.props) {
        try {
            data = {...data};
            data.limit = parseInt(data.limit) || 10;
            data.page = parseInt(data.page) || 1;

            const pipeline = [];

            pipeline.push({
                $project: {
                    __v: 0,
                    created_at: 0,
                    updated_at: 0,
                    content: 0,
                }
            })

            if (data && (data.pagination || data.infinite)) {
                // pagination stage to paginate documents
                if (!data || !data.page || !data.limit || isNaN(parseInt(data.page)) || isNaN(parseInt(data.limit))) {
                    // handle invalid data parameters
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
                    // handle valid data parameters
                    pipeline.push({
                        $facet: {
                            metadata: [
                                {$count: 'total'},
                                {
                                    $addFields: {
                                        limit: parseInt(data.limit, 10),
                                        page: parseInt(data.page)
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
                                {$skip: (parseInt(data.page) - 1) * parseInt(data.limit)},
                                {$limit: parseInt(data.limit)},
                                {$project: {_id: 0}}
                            ]
                        }
                    });
                }
            }

            data.pipeline = pipeline;
            const models = await this.getData(data)

            const get_data = (data.pagination || data.infinite) ? models[0].data : models;

            if (data && data.pagination) {
                const metadata = models[0].metadata[0];

                return {
                    total: metadata?.total || 0,
                    limit: metadata?.limit || data.limit,
                    totalPages: metadata?.totalPages || 0,
                    page: metadata?.page || 0,
                    hasPrevPage: metadata?.hasPrevPage || null,
                    hasNextPage: metadata?.hasNextPage || null,
                    prevPage: metadata?.prevPage || null,
                    nextPage: metadata?.nextPage || null,
                    data: get_data || []
                };
            } else {
                return get_data
            }
        } catch (e) {
            //console.log(e)
            if (data && data.pagination) {
                return {
                    total: 0,
                    limit: data.limit,
                    totalPages: 0,
                    page: 0,
                    hasPrevPage: null,
                    hasNextPage: null,
                    prevPage: null,
                    nextPage: null,
                    data: []
                };
            } else {
                return []
            }
        }
    }

    async getServiceType(data = this.props) {
        try {
            data = {...data};

            let ids = [];
            if (data.slug) ids.push({slug: data.slug.toLowerCase()});
            if (data._id) ids.push({_id: data._id});

            if (ids.length === 0) {
                return {
                    success: false,
                    message: 'Slug or _id is required',
                }
            }

            const pipeline = [];

            pipeline.push({
                $match: {
                    $or: ids
                }
            });

            pipeline.push({
                $project: {
                    __v: 0,
                    created_at: 0,
                    updated_at: 0,
                }
            })

            data.pipeline = pipeline;
            const model = await TypeModel.aggregate(data.pipeline);

            if (model[0]) {
                return {
                    success: true,
                    ...model[0],
                }
            } else {
                return {
                    success: false,
                    message: 'Not found',
                }
            }
        } catch (e) {
            //console.log(e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            }
        }
    }

    async getServiceTypes(data) {

        const pipeline = [];

        /* if(data.type){
             pipeline.push({
                 $match: {type: data.type}
             });
         }*/

        pipeline.push({
            $sort: {created_at: -1}
        });

        pipeline.push({
            $project: {
                _id: 0,
                __v: 0,
                created_at: 0,
                updated_at: 0,
            }
        })

        return TypeModel.aggregate(pipeline);
    }

    async createServiceType(data = this.props) {
        try {
            data = {...data};
            const errors = {};

            if (Utils.isEmpty(data.name)) {
                errors.name = 'Name is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            let newModel = new TypeModel()
            for (let field in data) {
                newModel[field] = data[field]
            }

            newModel.slug = await Utils.createSlug(TypeModel);
            const result = await newModel.save();

            return {
                success: true,
                ...result._doc,
                save: async () => await result.save()
            }
        } catch (e) {
            console.log("Service > createServiceType:", e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            };
        }
    }

    async updateServiceType(data = this.props) {
        try {
            data = {...data};

            let _ids = [];
            if (data?.slug) {
                _ids.push({slug: data.slug.toLowerCase()});
            }
            if (data?._id) {
                const idVal = data._id;
                if (idVal instanceof mongoose.Types.ObjectId) {
                    _ids.push({_id: idVal});
                } else if (mongoose.isValidObjectId(idVal)) {
                    _ids.push({_id: new mongoose.Types.ObjectId(idVal)});
                }
            }

            if (!_ids.length) {
                throw new Error('slug or _id is required');
            }

            const model = await TypeModel.findOne({$or: _ids});

            if (!model) {
                throw new Error('Not found');
            }

            delete data.slug;
            delete data._id;

            for (let field in data) {
                model[field] = data[field]
            }

            return await model.save();
        } catch (e) {
            //console.log("Service > updateServiceType:", e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            };
        }
    }

    async deleteServiceType(data = this.props) {
        try {
            data = {...data};
            const errors = {};

            if (Utils.isEmpty(data.slug) && Utils.isEmpty(data._id)) {
                errors.slug = 'Slug or _id is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            const model = await TypeModel.findOne({
                $or: [{slug: data.slug}, {_id: data._id}]
            });

            // Check if exists
            if (!model) {
                return {
                    success: false,
                    message: 'Not found',
                };
            }

            // Delete the model
            await model.deleteOne({slug: model.slug});

            return {
                success: true,
                message: 'Service type has successfully been deleted',
                //investment: investment
            };
        } catch (e) {
            console.log("Service > deleteServiceType:", e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            };
        }
    }

}

module.exports = Service
