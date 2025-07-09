
// Authentications
const authenticate = require('../../middleware/authenticate');
const slider = require('./controllers/SliderApi');

module.exports = function (router) {
    router.post('/api/slider/create-slider', authenticate, slider.createSlider);
    router.put('/api/slider/update-slider', authenticate, slider.updateSlider);
    router.delete('/api/slider/delete-slider', authenticate, slider.deleteSlider);
    router.get('/api/slider/get-slider', slider.getSlider);
    router.get('/api/slider/get-sliders', slider.getSliders);
};



