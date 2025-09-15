
const Testimonial = require("./Testimonial");


exports.getTestimonial = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const testimonial = new Testimonial(authUser);
        const getTestimonial = await testimonial.getTestimonial(query)

        if(getTestimonial){
            return res.json({
                success: true,
                ...getTestimonial,
                response: 'Testimonial Found',
                message: 'Testimonial data retrieved successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Testimonial Not Found',
                message: 'No testimonial found with the provided information.'
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

exports.getTestimonials = async (req, res) => {
    try {
        const query = req.query;
        let authUser = req.authUser;

        const testimonial = new Testimonial(query);
        const getTestimonials = await testimonial.getTestimonials(query)
        return res.json(getTestimonials);
    } catch (e) {
        return res.json([]);
    }
}

exports.createTestimonial = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        body.files = req.files;

        const testimonial = new Testimonial();
        const result = await testimonial.create(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Testimonial Found',
                message: 'Testimonial Created successfully.'
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

exports.updateTestimonial = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        body.files = req.files;

        const testimonial = new Testimonial();
        const result = await testimonial.update(body)

        if(result){
            return res.json({
                success: true,
                response: 'Testimonial Found',
                message: 'Testimonial updated successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error updating the testimonial, please try again'
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

exports.deleteTestimonial = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const testimonial = new Testimonial();
        const result = await testimonial.delete(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Testimonial Found',
                message: 'Testimonial delete successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error deleting the testimonial, please try again',
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

