
const Slider = require("./Slider");


exports.getSlider = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const slider = new Slider(authUser);
        const getSlider = await slider.getSlider(query)

        if(getSlider){
            return res.json({
                success: true,
                ...getSlider,
                response: 'Slider Found',
                message: 'Slider data retrieved successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Slider Not Found',
                message: 'No slider found with the provided information.'
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

exports.getSliders = async (req, res) => {
    try {
        const query = req.query;
        let authUser = req.authUser;

        const slider = new Slider(query);
        const getSliders = await slider.getSliders(query)
        return res.json(getSliders);
    } catch (e) {
        return res.json([]);
    }
}

exports.createSlider = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        const files = req.files;
        let body = req.body;
        let authUser = req.authUser;

        body.files = files;

        const slider = new Slider();
        const result = await slider.create(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Slider Found',
                message: 'Slider Created successfully.'
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

exports.updateSlider = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        const files = req.files;
        let body = req.body;
        let authUser = req.authUser;

        body.files = files;

        const slider = new Slider();
        const result = await slider.update(body)

        if(result){
            return res.json({
                success: true,
                response: 'Slider Found',
                message: 'Slider updated successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error updating the slider, please try again'
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

exports.deleteSlider = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const slider = new Slider();
        const result = await slider.delete(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Slider Found',
                message: 'Slider delete successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error deleting the slider, please try again',
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

