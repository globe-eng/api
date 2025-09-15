const express = require('express');
const router = express.Router();

require('./auth/AuthRoute')(router);
require('./user/UserRoute')(router);
require('./customer_support/CustomerSupportRoute')(router);
require('./team/TeamRoute')(router);
require('./project/ProjectRoute')(router);
require('./gallery/GalleryRoute')(router);
require('./service/ServiceRoute')(router);
require('./slider/SliderRoute')(router);
require('./blog/blogRoutes')(router);
require('./testimonial/TestimonialRoute')(router);

require('../services/email/EmailRoute')(router);


module.exports = router;
