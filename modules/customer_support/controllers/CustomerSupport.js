// Models
const SupportModel = require('../models/supportModel');
const SupportMessagesModel = require('../models/supportMessagesModel');

//Classes
const Utils = require("../../../lib/Utils")
const config = require("../../../lib/config");
const mongoose = require("mongoose");
const Notifications = require("../../notification/controllers/Notifications");
const User = require("../../user/controllers/User");
const TransactionModel = require("../../transaction/models/transactionModel");

const cloudinary = require("../../../lib/cloudinary");

class CustomerSupport {

    constructor(props = {}) {
        this.props = props;
    };

    async getSupportTicketData(data) {

        const pipeline = [];

        //IDs
        let _ids = [];
        if (data?.slug) {
            _ids.push({ slug: data.slug.toLowerCase() });
        }
        if (data?._id) {
            const idVal = data._id;
            if (idVal instanceof mongoose.Types.ObjectId) {
                _ids.push({ _id: idVal });
            } else if (mongoose.isValidObjectId(idVal)) {
                _ids.push({ _id: new mongoose.Types.ObjectId(idVal) });
            }
        }
        if(_ids.length){
            pipeline.push({
                $match: {
                    $or: _ids
                }
            });
        }

        if(data.status){
            pipeline.push({
                $match: {status: data.status}
            });
        }

        if(data.user){
            pipeline.push({
                $match: {user: data.user}
            });
        }

        pipeline.push({
            $sort: {created_at: -1}
        });


        // User
        pipeline.push({
            $lookup: {
                from: "users",
                let: {slugValue: "$user"},
                pipeline: [
                    {$match: {$expr: {$eq: ["$slug", "$$slugValue"]}}},
                    {
                        $project: User.user_project()
                    }
                ],
                as: "user"
            }
        });
        pipeline.push({
            $addFields: {
                user: {$arrayElemAt: ["$user", 0]}
            }
        })

        const data_pipeline = data?.pipeline? data?.pipeline: []
        const new_pipeline = [
            ...pipeline,
            ...data_pipeline
        ]
        return SupportModel.aggregate(new_pipeline);
    }

    // Create support ticket
    async createSupportTicket(data = this.props) {
        try {
            data = {...data};
            const errors = {};
            data.amount = parseFloat(data.amount);
            let plan

            if (Utils.isEmpty(data.title)) {
                errors.title = 'title is required';
            }

            if (Utils.isEmpty(data.description)) {
                errors.description = 'description is required';
            }


            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            const ticket = new SupportModel({
                slug: await Utils.createSlug(SupportModel),
                user: data.user,
                title: data.title,
                description: data.description,
                status: 'Open',
            })

            await ticket.save();

            return {
                success: true,
                message: 'Support ticket created successfully',
            }
        } catch (e) {
            console.log("CustomerSupport > createSupportTicket:", e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            };
        }
    }

    // Update support ticket status
    async updateSupportTicketStatus(data = this.props) {
        try {
            data = {...data};
            const errors = {};

            if (Utils.isEmpty(data.slug)) {
                errors.slug = 'slug is required';
            }

            if (Utils.isEmpty(data.status)) {
                errors.status = 'status is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            const ticket = await SupportModel.findOne({slug: data.slug});

            if (!ticket) {
                return {
                    success: false,
                    message: 'Support ticket not found',
                };
            }

            ticket.status = data.status;

            await ticket.save();

            return {
                success: true,
                message: 'Support ticket updated successfully',
            }
        } catch (e) {
            console.log("CustomerSupport > updateSupportTicket:", e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            };
        }
    }

    // Get support ticket
    async getSupportTicket(data = this.props) {
        try {
            data = {...data};

            let ids = [];
            if (data.slug) ids.push({slug: data.slug.toLowerCase()});
            if (data._id) ids.push({_id: data._id});

            if (ids.length === 0) {
                return {
                    success: false,
                    response: 'Ticket Not Found',
                    message: 'No Ticket found with the provided information.'
                };
            }

            const pipeline = [];

            pipeline.push({
                $match: {
                    $or: ids
                }
            });

            data.pipeline = pipeline;
            const ticket = await this.getSupportTicketData(data);

            if(ticket[0]){
                return {
                    success: true,
                    ...ticket[0],
                };
            } else {
                return {
                    success: false,
                    response: 'Ticket Not Found',
                    message: 'No Ticket found with the provided information.'
                };
            }
        } catch (e){
            console.log(e)
            return {
                success: false,
                response: 'Failed',
                message: 'There was an error, please try again'
            }
        }
    }

    // Get support tickets
    async getSupportTickets(data = this.props) {
        try {
            data = {...data};
            data.limit = parseInt(data.limit) || 10;
            data.page = parseInt(data.page) || 1;

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
            const tickets = await this.getSupportTicketData(data)

            const get_data = (data.pagination || data.infinite) ? tickets[0].data : tickets;

            if (data && data.pagination) {
                const metadata = tickets[0].metadata[0];

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


    // Get support ticket messages
    async getSupportTicketMessages(data = this.props) {
        try {
            data = {...data};
            const pipeline = [];

            if(!data || !data.ticket){
                return [];
            }

            //IDs
            let _ids = [];
            if (data?.slug) {
                _ids.push({ slug: data.slug.toLowerCase() });
            }
            if (data?._id) {
                const idVal = data._id;
                if (idVal instanceof mongoose.Types.ObjectId) {
                    _ids.push({ _id: idVal });
                } else if (mongoose.isValidObjectId(idVal)) {
                    _ids.push({ _id: new mongoose.Types.ObjectId(idVal) });
                }
            }
            if(_ids.length){
                pipeline.push({
                    $match: {
                        $or: _ids
                    }
                });
            }

            if(data.ticket){
                pipeline.push({
                    $match: {ticket: data.ticket}
                });
            }

            if(data.sender){
                pipeline.push({
                    $match: {sender: data.sender}
                });
            }

            if(data.receiver){
                pipeline.push({
                    $match: {receiver: data.receiver}
                });
            }

            pipeline.push({
                $sort: {created_at: 1}
            });


            // User
            pipeline.push({
                $lookup: {
                    from: "users",
                    let: {slugValue: "$user"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$slug", "$$slugValue"]}}},
                        {
                            $project: User.user_project()
                        }
                    ],
                    as: "user"
                }
            });

            pipeline.push({
                $addFields: {
                    user: {$arrayElemAt: ["$user", 0]}
                }
            })

            return SupportMessagesModel.aggregate(pipeline);
        } catch (e) {
           return []
        }
    }


    // Send a message
    async sendMessage(data = this.props) {
        try {
            data = {...data};
            const errors = {};

            if (Utils.isEmpty(data.ticket)) {
                errors.ticket = 'ticket is required';
            }

            if (Utils.isEmpty(data.type)) {
                errors.type = 'type is required';
            }

            if (Utils.isEmpty(data.sender)) {
                errors.sender = 'sender is required';
            }

            if (Utils.isEmpty(data.receiver)) {
                errors.receiver = 'receiver is required';
            }

            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            const message = new SupportMessagesModel({})
            message.slug = await Utils.createSlug(SupportMessagesModel);
            message.ticket = data.ticket;
            message.sender = data.sender;
            message.receiver = data.receiver;
            message.message =  data.message || '';
            message.type = data.type;

            if(data?.files && data?.files?.image) {
                if(data.type === 'image'){
                    const folder = `message`;
                    const file = data?.files.image;
                    const uploadMedia = await cloudinary.upload({
                        folder: folder,
                        media: file.filepath,
                        name: message.slug,
                    });
                    if (uploadMedia.success) {
                        message.image = uploadMedia.link;
                        message.image_path = uploadMedia.path;
                        message.image_key = uploadMedia.key;
                    }
                    console.log(uploadMedia)
                }
            }

            await message.save();

            // Notify receiver
            /*const notificationData = {
                user: data.receiver,
                type: 'support_message',
                title: `New message from ${data.sender}`,
                body: `You have a new message in your support ticket.`,
                data: {
                    ticket_slug: data.ticket,
                    message_slug: message.slug
                }
            };*/

            return {
                success: true,
                message: 'Message sent successfully',
            }
        } catch (e) {
            console.log("CustomerSupport > sendMessage:", e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            };
        }
    }


    // Read messages
    async readMessages(data = this.props) {
        try {
            data = {...data};
            const errors = {};

            if (Utils.isEmpty(data.ticket)) {
                errors.ticket = 'ticket is required';
            }

            if (Utils.isEmpty(data.user)) {
                errors.user = 'user is required';
            }

            if (Utils.isEmpty(data.reader)) {
                errors.reader = 'reader is required';
            } else {
                // Ensure reader is admin || user
                if(!['admin', 'user'].includes(data.reader)) {
                    errors.reader = 'reader must be either admin or user';
                }
            }


            if (!Utils.isEmpty(errors)) {
                return {
                    success: false,
                    message: 'Please enter the required fields',
                    errors: errors
                };
            }

            const filter = {
                read: false,
                ticket: data.ticket
            }

            if(data.reader === "admin"){
                filter.sender = data.user
            }

            if(data.reader === "user"){
                filter.sender = "admin"
            }

            const messages = await SupportMessagesModel.updateMany(filter, {read: true});

            return {
                success: true,
                message: 'Messages marked as read successfully',
            }
        } catch (e) {
            console.log("CustomerSupport > readMessages:", e)
            return {
                success: false,
                message: 'There was an error, please try again!',
            };
        }
    }


}


module.exports = CustomerSupport