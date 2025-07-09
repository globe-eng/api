
const Gallery = require("./Gallery");
 

exports.getGallery = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const gallery = new Gallery(authUser);
        const getGallery = await gallery.getGallery(query)

        if(getGallery){
            return res.json({
                success: true,
                ...getGallery,
                response: 'Gallery Found',
                message: 'Gallery data retrieved successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Gallery Not Found',
                message: 'No gallery found with the provided information.'
            });
        }
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

exports.getGalleries = async (req, res) => {
    try {
        const query = req.query;
        let authUser = req.authUser;

        const gallery = new Gallery(query);
        const getGalleries = await gallery.getGalleries(query)
        return res.json(getGalleries);
    } catch (e) {
        return res.json([]);
    }
}

exports.createGallery = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        const files = req.files;
        let body = req.body;
        let authUser = req.authUser;

        body.files = files;

        const gallery = new Gallery();
        const result = await gallery.create(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Gallery Found',
                message: 'Gallery Created successfully.'
            });
        } else {
            return res.json(result);
        }

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

exports.updateGallery = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        const files = req.files;
        let body = req.body;
        let authUser = req.authUser;

        body.files = files;

        const gallery = new Gallery();
        const result = await gallery.update(body)

        if(result){
            return res.json({
                success: true,
                response: 'Gallery Found',
                message: 'Gallery updated successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error updating the gallery, please try again'
            });
        }

    } catch (e) {
        //console.log(e)
        return res.json({
            success: false,
            response: e.message || 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

exports.deleteGallery = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const gallery = new Gallery();
        const result = await gallery.delete(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Gallery Found',
                message: 'Gallery delete successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error deleting the gallery, please try again',
                ...result,
            });
        }

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}


// get gallery category
exports.getGalleryCategory = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const gallery = new Gallery(authUser);
        const getGalleryCategory = await gallery.getGalleryCategory(query)

        if(getGalleryCategory){
            return res.json({
                success: true,
                ...getGalleryCategory,
                response: 'Gallery Category Found',
                message: 'Gallery category data retrieved successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Gallery Category Not Found',
                message: 'No gallery category found with the provided information.'
            });
        }
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

// get gallery categories
exports.getGalleryCategories = async (req, res) => {
    try {
        const query = req.query;
        let authUser = req.authUser;

        const gallery = new Gallery(query);
        const getGalleryCategories = await gallery.getGalleryCategories(query)
        return res.json(getGalleryCategories);
    } catch (e) {
        return res.json([]);
    }
}

// create gallery category
exports.createGalleryCategory = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const gallery = new Gallery();
        const result = await gallery.createGalleryCategory(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Gallery Category Found',
                message: 'Gallery Category Created successfully.'
            });
        } else {
            return res.json(result);
        }

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

// update gallery category
exports.updateGalleryCategory = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const gallery = new Gallery();
        const result = await gallery.updateGalleryCategory(body)

        if(result){
            return res.json({
                success: true,
                response: 'Gallery Category Found',
                message: 'Gallery Category updated successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error updating the gallery category, please try again'
            });
        }

    } catch (e) {
        //console.log(e)
        return res.json({
            success: false,
            response: e.message || 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

// delete gallery category
exports.deleteGalleryCategory = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const gallery = new Gallery();
        const result = await gallery.deleteGalleryCategory(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Gallery Category Found',
                message: 'Gallery Category delete successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error deleting the gallery category, please try again',
                ...result,
            });
        }

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}