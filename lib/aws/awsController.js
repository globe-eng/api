const utils = require('../../utils');
const config = require('../../lib/config');
const fs = require('fs');
const AWS = require('aws-sdk');
const axios = require('axios');
const mime = require('mime-types');

const s3 = new AWS.S3({
    accessKeyId: config.awsAccessKey,
    secretAccessKey: config.awsSecretKey,
});

const bucket = "pts-app-bucket2";

exports.upload = async (data) => {
    try {

        const errors = {};

        if (utils.isEmpty(data.key)) {
            errors.Key = 'Key is required';
        }

        if (utils.isEmpty(data.media)) {
            errors.media = 'Media required';
        }

        //Check validation
        if (!utils.isEmpty(errors)) {
            return {
                success: false,
                message: 'Please enter the required fields',
                errors: errors
            }
        } else {

            const uploadParams = {
                Bucket: bucket,
                Key: data.key,
                Body: fs.createReadStream(data?.media?.filepath),
                ContentType: data?.media?.mimetype
            }

            const result = await s3.upload(uploadParams).promise();

            return {
                success: true,
                link: result.Location,
                key: result.key,
                message: null
            }
        }

    } catch (error) {
        return {
            success: true,
            link: null,
            key: null,
            message: "There was an error, please try again",
            error: error,
        }
    }
}

exports.uploadBase64 = async (data) => {
    try {

        const errors = {};

        if (utils.isEmpty(data.key)) {
            errors.Key = 'Key is required';
        }

        if (utils.isEmpty(data.media)) {
            errors.media = 'Media required';
        }

        //Check validation
        if (!utils.isEmpty(errors)) {
            return {
                success: false,
                message: 'Please enter the required fields',
                errors: errors
            }
        } else {
            const buffer = Buffer.from(data.media.replace(/^data:image\/\w+;base64,/, ""),'base64');
            const type = data.media.split(';')[0].split('/')[1];
            const uploadParams = {
                Bucket: bucket,
                Key: data.key,
                Body: buffer,
                ContentType: `image/${type}`,
                ContentEncoding: 'base64',
            }

            const result = await s3.upload(uploadParams).promise();

            return {
                success: true,
                link: result.Location,
                key: result.key,
                message: null
            }
        }

    } catch (error) {
        return {
            success: true,
            link: null,
            key: null,
            message: "There was an error, please try again",
            error: error,
        }
    }
}


exports.uploadURL = async (data) => {
    try {

        const errors = {};

        if (utils.isEmpty(data.key)) {
            errors.Key = 'Key is required';
        }

        if (utils.isEmpty(data.media)) {
            errors.media = 'Media required';
        }

        //Check validation
        if (!utils.isEmpty(errors)) {
            return {
                success: false,
                message: 'Please enter the required fields',
                errors: errors
            }
        } else {

            const response = await axios.get(data.media, { responseType: 'arraybuffer' });
            const imageData = response.data;

            // Get the content type based on the file extension
            const fileExtension = data.media.split('.').pop();
            const contentType = mime.lookup(fileExtension);

            const uploadParams = {
                Bucket: bucket,
                Key: data.key,
                Body: imageData,
                ContentType: contentType
            }

            const result = await s3.upload(uploadParams).promise();

            return {
                success: true,
                link: result.Location,
                key: result.key,
                message: null
            }
        }

    } catch (error) {
        return {
            success: true,
            link: null,
            key: null,
            message: "There was an error, please try again",
            error: error,
        }
    }
}


exports.delete = async (key) => {
    try {
        const result = await s3.deleteObject({Bucket: bucket, Key: key}).promise();
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

const deleteFolder = async (key) =>{
    try {
        const objects = await s3.listObjects({Bucket: bucket, Prefix: key,}).promise();
        if (objects.Contents.length === 0) {
            return {
                success: true,
                error: null,
                message: 'Folder is empty',
            }
        }

        let deleteObjectsParam = {Bucket: bucket, Delete: {Objects: []},}
        objects.Contents.forEach(content => {
            deleteObjectsParam.Delete.Objects.push({Key: content.Key});
        });

        const result = await s3.deleteObjects(deleteObjectsParam).promise();

        if(objects.IsTruncated){
            await deleteFolder(key)
        } else {
            return {
                success: true,
                error: null,
                message: 'Folder deleted',
                result: result
            }
        }

    } catch (error) {
        return {
            success: false,
            error: error,
            message: 'There was an error, please try again'
        }
    }
}

exports.deleteFolder = deleteFolder


exports.download = async (req, res) => {
    try {
        const result = await s3.getObject({Bucket: bucket, Key: ""}).promise();
        res.send(result.body)
    } catch (error) {
        return res.status(404).json({
            error: "Not Found!",
            //e: err
        })
    }
}
