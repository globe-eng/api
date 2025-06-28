// Models
const UserModel = require('../../user/models/userModel');

//Classes
const Utils = require("../../../lib/Utils")
const config = require("../../../lib/config");
const mongoose = require("mongoose");


class User {

    constructor(props = {}) {
        this.props = props;
        this.slug = props.slug;
        this.email = props.email;
        this._id = props._id;
    };

    ids(data) {
        let _ids = [];
        if (data?.slug) {
            _ids.push({slug: data.slug.toLowerCase()});
        }
        if (data?.username) {
            _ids.push({username: data.username.toLowerCase()});
        }
        if (data?.email) {
            _ids.push({email: data.email.toLowerCase()});
        }
        if (data?._id) {
            const idVal = data._id;
            if (idVal instanceof mongoose.Types.ObjectId) {
                _ids.push({_id: idVal});
            } else if (mongoose.isValidObjectId(idVal)) {
                _ids.push({_id: new mongoose.Types.ObjectId(idVal)});
            }
        }
        return _ids
    }

    static user_project() {
        return {
            _id: 1,
            slug: 1,
            email: 1,
            //photo: 1,
            role: 1,
            //settings: 1,
            first_name: 1,
            last_name: 1,
        }
    }

    getUserPayload(data) {
        return {
            id: data.id || data._id,
            role: data.role,
            slug: data.slug,
            first_name: data.first_name,
            last_name: data.last_name,
            full_name: data.full_name,
            email: data.email,
            settings: data.settings,
            username: data.username,
            account_type: data.username,
            gender: data.gender,
            email_verified: data.email_verified,
            photo: data.photo,
        }
    }

    async aggregate(filter = this.props) {
        return UserModel.aggregate(filter)
    }

    static aggregate = async (filter) => {
        return UserModel.aggregate(filter)
    }

    async find(filter = this.props) {
        return UserModel.find(filter)
    }

    async findOne(filter = this.props) {
        return UserModel.findOne(filter)
    }

    async data(data) {
        try {
            data = {...data};
            const pipeline = [];

            if (this.ids(data).length) {
                pipeline.push({
                    $match: {
                        $or: this.ids(data)
                    }
                })
            }

            pipeline.push({
                $lookup: {
                    from: "auth-roles",
                    let: {slugValue: "$role"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$name", "$$slugValue"]}}},
                        {
                            $project: {
                                _id: 0,
                                __v: 0,
                                created_at: 0,
                                updated_at: 0,
                            }
                        }
                    ],
                    as: "role"
                }
            });
            pipeline.push({$addFields: {role: {$arrayElemAt: ["$role", 0]}}});

            // Get country data
            pipeline.push({
                $lookup: {
                    from: "countries",
                    let: {slugValue: "$country"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$slug", "$$slugValue"]}}},
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                                slug: 1,
                                iso3: 1,
                                iso2: 1,
                                currency: 1,
                                currency_name: 1,
                                currency_symbol: 1
                            }
                        }
                    ],
                    as: "country"
                }
            });
            pipeline.push({$addFields: {country: {$arrayElemAt: ["$country", 0]}}});

            // Get State data
            pipeline.push({
                $lookup: {
                    from: "states",
                    let: {slugValue: "$state"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$slug", "$$slugValue"]}}},
                        {
                            $project: {_id: 0, name: 1, slug: 1}
                        }
                    ],
                    as: "state"
                }
            });
            pipeline.push({$addFields: {state: {$arrayElemAt: ["$state", 0]}}});

            // Get City data
            pipeline.push({
                $lookup: {
                    from: "cities",
                    let: {slugValue: "$city"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$slug", "$$slugValue"]}}},
                        {
                            $project: {_id: 0, name: 1, slug: 1}
                        }
                    ],
                    as: "city"
                }
            });
            pipeline.push({$addFields: {city: {$arrayElemAt: ["$city", 0]}}});

            if(!data.sensitive){
                pipeline.push({
                    $project: {
                        __v: 0,
                        password: 0,
                        reset_password_code: 0,
                        confirm_email_code: 0,
                    }
                })
            }

            const data_pipeline = data?.pipeline ? data?.pipeline : []
            const new_pipeline = [
                ...pipeline,
                ...data_pipeline
            ]

            return await UserModel.aggregate(new_pipeline);

        } catch (e) {
            console.log("User > getData:", e)
            return [];
        }
    }

    async update(data = this.props) {
        try {
            data = {...data};

            let _ids = [];
            if (data?.slug) {
                _ids.push({slug: data.slug.toLowerCase()});
            }
            if (data?.username) {
                _ids.push({username: data.username.toLowerCase()});
            }
            if (data?.email) {
                _ids.push({email: data.email.toLowerCase()});
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
                throw new Error('slug, email, _id or username is required');
            }

            const user = await UserModel.findOne({$or: _ids});

            if (!user) {
                throw new Error('User not found');
            }

            delete data.slug;
            delete data.email;
            delete data.username;
            delete data._id;

            for (let field in data) {
                user[field] = data[field]
            }

            return await user.save();
        } catch (e) {
            console.log("User > update:", e)
            return e;
        }
    }

    async userData(data = this.props) {
        try {
            if (!this.ids(data).length) {
                return null;
            }
            data.sensitive = true
            const results = await this.data(data);
            if (results[0]) {
                return results[0];
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    }

    async userExist(data = this.props) {
        try {
            if (!this.ids(data).length) {
                return false;
            }
            const user = await UserModel.findOne({$or: this.ids(data)})
            return !!user;
        } catch (e) {
            return false
        }
    }

    async createUser(data = this.props) {
        try {
            data = {...data};
            const errors = {};

            if (Utils.isEmpty(data.email)) {
                errors.email = 'Email is required';
            } else {
                if (!Utils.isEmail(data.email)) {
                    errors.email = 'Invalid email address';
                } else {
                    if (await this.userExist({email: data.email})) {
                        errors.email = 'Email already exists';
                    }
                }
            }

            if (Utils.isEmpty(data.username)) {
                //errors.username = 'Username is required';
            } else {
                const min = 3;
                const max = 20;
                const regex = /^[a-zA-Z0-9_]+$/;

                if (data.username.length < min) {
                    errors.username = `Username must be at least ${min} characters`;
                } else if (data.username.length > 15) {
                    errors.username = `Username must be no more than ${max} characters`;
                } else if (!regex.test(data.username)) {
                    errors.username = `Username can only contain letters, numbers, and underscores`;
                } else {
                    if (await this.userExist({username: data.username})) {
                        errors.username = 'Username already exists';
                    }
                }
            }

            if (Utils.isEmpty(data.password)) {
                errors.password = 'Password is required';
            } else if (data.password) {
                if (!Utils.isPassword(data.password).valid) {
                    errors.password = {
                        message: Utils.isPassword(data.password).message,
                        requirements: Utils.isPassword(data.password).requirements,
                    }
                }
            }

            const name_regex = /^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/;
            if (Utils.isEmpty(data.first_name)) {
                errors.first_name = 'First name is required';
            } else {
                if (data.first_name.length < config.name_min) {
                    errors.first_name = `First name must be at least ${config.name_min} characters`;
                } else if (data.first_name.length > config.name_max) {
                    errors.first_name = `First name must be no more than ${config.name_max} characters`;
                } else if (!name_regex.test(data.first_name)) {
                    errors.first_name = `First name can only contain letters, numbers, and underscores`;
                }
            }

            if (Utils.isEmpty(data.last_name)) {
                errors.last_name = 'Last name is required';
            } else {
                if (data.last_name.length < config.name_min) {
                    errors.last_name = `Last name must be at least ${config.name_min} characters`;
                } else if (data.last_name.length > config.name_max) {
                    errors.last_name = `Last name must be no more than ${config.name_max} characters`;
                } else if (!name_regex.test(data.last_name)) {
                    errors.last_name = `Last name can only contain letters, numbers, and underscores`;
                }
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            let newUser = new UserModel()
            for (let field in data) {
                newUser[field] = data[field]
            }

            newUser.password = await Utils.encryptPassword(data.password);
            newUser.slug = await Utils.createSlug(UserModel);
            newUser.first_name = Utils.capitalizeEveryWordFirstLetter(data.first_name);
            newUser.last_name = Utils.capitalizeEveryWordFirstLetter(data.last_name);

            const result = await newUser.save();

            return {
                success: true,
                ...result._doc,
                save: async () => await result.save()
            }
        } catch (e) {
            console.log("User > createUser:", e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            };
        }
    }

    async updateUser(data = this.props) {
        try {
            data = {...data};
            const errors = {};
            const name_regex = /^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/;

             if (!Utils.isEmpty(data.first_name)) {
                 if (data.first_name.length < config.name_min) {
                     errors.first_name = `First name must be at least ${config.name_min} characters`;
                 } else if (data.first_name.length > config.name_max) {
                     errors.first_name = `First name must be no more than ${config.name_min} characters`;
                 } else if (!name_regex.test(data.first_name)) {
                     errors.first_name = `First name can only contain letters, numbers, and underscores`;
                 } else {
                     data.first_name = Utils.capitalizeEveryWordFirstLetter(data.first_name);
                 }
             }

            if (!Utils.isEmpty(data.last_name)) {
                if (data.last_name.length < config.name_min) {
                    errors.last_name = `Last name must be at least ${config.name_min} characters`;
                } else if (data.last_name.length > config.name_max) {
                    errors.last_name = `Last name must be no more than ${config.name_min} characters`;
                } else if (!name_regex.test(data.last_name)) {
                    errors.last_name = `Last name can only contain letters, numbers, and underscores`;
                } else {
                    data.last_name = Utils.capitalizeEveryWordFirstLetter(data.last_name);
                }
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    message: 'Please enter the required fields!',
                }
            }


            let _ids = [];
            if (data?.slug) {
                _ids.push({slug: data.slug.toLowerCase()});
            }
            if (data?.username) {
                _ids.push({username: data.username.toLowerCase()});
            }
            if (data?.email) {
                _ids.push({email: data.email.toLowerCase()});
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
               return {
                   success: false,
                   message: 'There was an error, please try again!',
               }
            }

            const user = await UserModel.findOne({$or: _ids});

            delete data.slug;
            delete data.email;
            delete data.username;
            delete data._id;

            for (let field in data) {
                user[field] = data[field]
            }

            await user.save()

            return{
                success: true,
                message: 'Account updated successfully'
            }
        } catch (e) {
            console.log("User > updateUser:", e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            };
        }
    }

    async getUser(data = this.props) {
        try {
            data = {...data};
            if (!this.ids(data).length) {
                return null;
            }
            delete data.sensitive
            const userData = await this.data(data)
            if (userData[0]) {
                const user = userData[0];
                user.full_name = `${user.first_name} ${user.last_name}`;
                return user;
            } else {
                return null;
            }
        } catch (e) {
            console.log("User > getUser:", e)
            return null;
        }
    }

    async getUsers(data = this.props) {
        try {
            data = {...data};
            data.limit = parseInt(data.limit) || 10;
            data.page = parseInt(data.page) || 1;

            delete data.sensitive

            const pipeline = [];

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
            const users = await this.data(data)

            const get_data = (data.pagination || data.infinite) ? users[0].data : users;

            if (data && data.pagination) {
                const metadata = users[0].metadata[0];
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

}


module.exports = User