const cloudinary = require('cloudinary').v2;
const config = require('./config');
const utils = require("../utils");
const fs = require("fs");

cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_api_secret
})

//module.exports = cloudinary


exports.upload = async (data) => {
    try {

        const errors = {};

        if (utils.isEmpty(data.folder)) {
            errors.folder = 'folder is required';
        }

        if (utils.isEmpty(data.media)) {
            errors.media = 'Media required';
        }

        if (utils.isEmpty(data.name)) {
            errors.name = 'Name required';
        }

        //Check validation
        if (!utils.isEmpty(errors)) {
            return {
                success: false,
                message: 'Please enter the required fields',
                errors: errors
            }
        } else {
            const result = await cloudinary.uploader.upload(data.media, {
                folder: data.folder,
                resource_type: "auto",
                public_id: data.name,
            });

            //console.log(result)

            return {
                success: true,
                link: result.secure_url,
                key: result.public_id,
                path: result?.secure_url?.split('/')?.slice(6)?.join('/'),
                message: null
            }
        }

    } catch (error) {
        return {
            success: false,
            link: null,
            key: null,
            path: null,
            message: "There was an error, please try again",
            error: error,
        }
    }
}


exports.delete = async (key) => {
    try {
        const result = await cloudinary.uploader.destroy(key);
        return {
            success: true,
            error: null,
            message: 'Media deleted',
            result: result
        }
    } catch (error) {
        return {
            success: false,
            error: error,
            message: 'There was an error, please try again'
        }
    }
}

exports.deleteFolder = async (path) => {
    try {
        const result = await cloudinary.api.delete_folder(path);
        return {
            success: true,
            error: null,
            message: 'Media deleted',
            result: result
        }
    } catch (error) {
        return {
            success: false,
            error: error,
            message: 'There was an error, please try again'
        }
    }
}