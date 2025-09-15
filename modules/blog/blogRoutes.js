/**
 * Controller to handle user operations
 */
'use strict';

// Authentications
const authenticate = require('../../middleware/authenticate');

const post = require('./controllers/blogPost');
const tag = require('./controllers/blogTag');
const category = require('./controllers/blogCategory');
const comment = require('./controllers/blogComment');


module.exports = function (router) {


    /***********************************************************
     *               Blog Api
     * ********************************************************/

    // Post
    router.get('/api/blog/post', post.getPosts);
    router.post('/api/blog/post', post.createPost);
    router.post('/api/blog/post/view', post.viewPost);
    router.post('/api/blog/post/like', post.likePost);
    router.delete('/api/blog/post/:slug', post.deletePost);
    router.put('/api/blog/post', post.editPost);


    // Category
    router.get('/api/blog/category', category.getCategories);
    router.put('/api/blog/category', authenticate, category.editCategory);
    router.delete('/api/blog/category/:slug', authenticate, category.deleteCategory);
    router.post('/api/blog/category', authenticate, category.addCategory);


    // Tag
    router.get('/api/blog/tag', tag.getTags);
    router.put('/api/blog/tag', authenticate, tag.editTag);
    router.delete('/api/blog/tag/:slug', authenticate, tag.deleteTag);
    router.post('/api/blog/tag', authenticate, tag.addTag);


    //Comment
    router.post('/api/blog/comment', authenticate, comment.postComment);
    router.put('/api/blog/comment', authenticate, comment.editComment);
    router.delete('/api/blog/comment/:slug', authenticate, comment.deleteComment);
    router.get('/api/blog/comment', comment.getComments);


};