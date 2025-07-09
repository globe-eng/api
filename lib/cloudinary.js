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

exports.deleteFolderWithSubs = async (folderPath) => {
    try {

        // Step 1: Get subfolders
        const subfoldersResponse = await cloudinary.api.sub_folders(folderPath);
        const subfolders = subfoldersResponse.folders || [];

        // Step 2: Recursively delete each subfolder
        for (const subfolder of subfolders) {
            await deleteFolderRecursive(subfolder.path);
        }

        // Step 3: List all resources in the current folder
        let nextCursor = null;
        do {
            const resourcesResponse = await cloudinary.api.resources({
                type: 'upload',
                prefix: folderPath + '/',
                max_results: 500,
                next_cursor: nextCursor,
            });

            const publicIds = resourcesResponse.resources.map(res => res.public_id);
            if (publicIds.length > 0) {
                await cloudinary.api.delete_resources(publicIds);
            }

            nextCursor = resourcesResponse.next_cursor;
        } while (nextCursor);

        // Step 4: Delete the folder itself
        const result = await cloudinary.api.delete_folder(folderPath);

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

exports.deleteFolder = async (folderPath) => {
    try {

        const resources = await cloudinary.api.resources({
            type: 'upload',
            prefix: folderPath + '/',
            max_results: 500
        });

        // 2. Delete all resources
        const publicIds = resources.resources.map(file => file.public_id);
        if (publicIds.length > 0) {
            await cloudinary.api.delete_resources(publicIds);
        }

        const result = await cloudinary.api.delete_folder(folderPath);

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