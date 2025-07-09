'use strict';

const authenticate = require('../../middleware/authenticate');
const gallery = require('./controllers/GalleryApi'); 


module.exports = function (router) {
    router.post('/api/gallery/create-gallery', authenticate, gallery.createGallery);
    router.put('/api/gallery/update-gallery', authenticate, gallery.updateGallery);
    router.delete('/api/gallery/delete-gallery', authenticate, gallery.deleteGallery);
    router.get('/api/gallery/get-gallery', gallery.getGallery);
    router.get('/api/gallery/get-galleries', gallery.getGalleries);

    router.get('/api/gallery/get-gallery-categories', gallery.getGalleryCategories);
    router.get('/api/gallery/get-gallery-category', gallery.getGalleryCategory);
    router.post('/api/gallery/create-gallery-category', authenticate, gallery.createGalleryCategory);
    router.put('/api/gallery/update-gallery-category', authenticate, gallery.updateGalleryCategory);
    router.delete('/api/gallery/delete-gallery-category', authenticate, gallery.deleteGalleryCategory);
};



