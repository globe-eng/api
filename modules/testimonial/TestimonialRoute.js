'use strict';

const authenticate = require('../../middleware/authenticate');
const testimonial = require('./controllers/TestimonialApi');

module.exports = function (router) {
    router.post('/api/testimonial/create-testimonial', authenticate, testimonial.createTestimonial);
    router.put('/api/testimonial/update-testimonial', authenticate, testimonial.updateTestimonial);
    router.delete('/api/testimonial/delete-testimonial', authenticate, testimonial.deleteTestimonial);
    router.get('/api/testimonial/get-testimonial', testimonial.getTestimonial);
    router.get('/api/testimonial/get-testimonials', testimonial.getTestimonials);
};



